import type { ItemPrice } from '@copperline/shared';
import type { Db } from './db';

export interface PricedItem {
  id: number;
  sku: string;
  unitCostCents: number;
}

export interface VendorClient {
  getPrice(item: PricedItem): Promise<ItemPrice>;
}

interface CacheRow {
  unit_cost_cents: number;
  fetched_at: string;
}

export function createVendorClient(opts: {
  baseUrl: string;
  db: Db;
  ttlMs?: number;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}): VendorClient {
  const ttlMs = opts.ttlMs ?? 60 * 60 * 1000;
  const timeoutMs = opts.timeoutMs ?? 2000;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const now = opts.now ?? (() => new Date());
  const readCache = opts.db.prepare(
    'SELECT unit_cost_cents, fetched_at FROM price_cache WHERE item_id = ?',
  );
  const writeCache = opts.db.prepare(
    `INSERT INTO price_cache (item_id, unit_cost_cents, fetched_at) VALUES (?, ?, ?)
     ON CONFLICT(item_id) DO UPDATE SET unit_cost_cents = excluded.unit_cost_cents, fetched_at = excluded.fetched_at`,
  );

  return {
    async getPrice(item) {
      const cached = readCache.get(item.id) as CacheRow | undefined;
      const fromCache = (row: CacheRow): ItemPrice => ({
        itemId: item.id,
        unitCostCents: row.unit_cost_cents,
        source: 'cache',
        fetchedAt: row.fetched_at,
      });
      if (cached && now().getTime() - Date.parse(cached.fetched_at) < ttlMs)
        return fromCache(cached);

      try {
        const res = await fetchImpl(`${opts.baseUrl}/prices/${encodeURIComponent(item.sku)}`, {
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!res.ok) throw new Error(`vendor responded ${res.status}`);
        const body = (await res.json()) as { unitCostCents: number };
        const fetchedAt = now().toISOString();
        writeCache.run(item.id, body.unitCostCents, fetchedAt);
        return { itemId: item.id, unitCostCents: body.unitCostCents, source: 'vendor', fetchedAt };
      } catch {
        if (cached) return fromCache(cached);
        return {
          itemId: item.id,
          unitCostCents: item.unitCostCents,
          source: 'fallback',
          fetchedAt: now().toISOString(),
        };
      }
    },
  };
}
