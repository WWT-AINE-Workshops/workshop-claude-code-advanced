import type { ItemPrice } from '@copperline/shared';
import { buildApp } from '../src/app';
import { openDb } from '../src/db';
import { seed } from '../src/seed';
import type { VendorClient } from '../src/vendor';

export function fixedVendor(cents = 1234): VendorClient {
  return {
    getPrice: async (item): Promise<ItemPrice> => ({
      itemId: item.id,
      unitCostCents: cents,
      source: 'vendor',
      fetchedAt: '2026-09-01T00:00:00.000Z',
    }),
  };
}

export function makeTestApp(opts: { vendor?: VendorClient; now?: () => Date } = {}) {
  const db = openDb(':memory:');
  seed(db);
  const app = buildApp({ db, vendor: opts.vendor ?? fixedVendor(), now: opts.now });
  return { app, db };
}

export const as = (userId: number) => ({ 'x-user-id': String(userId) });
