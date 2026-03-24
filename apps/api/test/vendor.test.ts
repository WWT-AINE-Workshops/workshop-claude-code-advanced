import { describe, expect, it, vi } from 'vitest';
import { openDb } from '../src/db';
import { seed } from '../src/seed';
import { createVendorClient } from '../src/vendor';

const CAM = { id: 9, sku: 'CAM-HD', unitCostCents: 8900 };
const ok = (cents: number) =>
  vi.fn(
    async () =>
      new Response(JSON.stringify({ sku: 'CAM-HD', unitCostCents: cents, currency: 'USD' })),
  );

function setup(fetchImpl: typeof fetch, nowIso = '2026-09-10T10:00:00.000Z') {
  const db = openDb(':memory:');
  seed(db);
  let now = new Date(nowIso);
  const client = createVendorClient({
    baseUrl: 'http://vendor.test',
    db,
    fetchImpl,
    now: () => now,
  });
  return { db, client, advance: (ms: number) => (now = new Date(now.getTime() + ms)) };
}

describe('vendor client', () => {
  it('fetches from the vendor and caches the price', async () => {
    const fetchImpl = ok(9100);
    const { client } = setup(fetchImpl);
    expect(await client.getPrice(CAM)).toMatchObject({
      itemId: 9,
      unitCostCents: 9100,
      source: 'vendor',
    });
    expect(await client.getPrice(CAM)).toMatchObject({ unitCostCents: 9100, source: 'cache' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect((fetchImpl.mock.calls[0] as unknown[])[0]).toBe('http://vendor.test/prices/CAM-HD');
  });

  it('refetches after the TTL expires', async () => {
    const fetchImpl = ok(9100);
    const { client, advance } = setup(fetchImpl);
    await client.getPrice(CAM);
    advance(60 * 60 * 1000 + 1);
    expect(await client.getPrice(CAM)).toMatchObject({ source: 'vendor' });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('serves a stale cached price when the vendor rate-limits', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ unitCostCents: 9100 })))
      .mockResolvedValueOnce(new Response('{"error":"rate_limited"}', { status: 429 }));
    const { client, advance } = setup(fetchImpl as unknown as typeof fetch);
    await client.getPrice(CAM);
    advance(2 * 60 * 60 * 1000);
    expect(await client.getPrice(CAM)).toMatchObject({ unitCostCents: 9100, source: 'cache' });
  });

  it('falls back to the catalog cost when the vendor is unreachable and nothing is cached', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const { client } = setup(fetchImpl as unknown as typeof fetch);
    expect(await client.getPrice(CAM)).toMatchObject({ unitCostCents: 8900, source: 'fallback' });
  });
});
