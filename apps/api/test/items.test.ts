import { describe, expect, it } from 'vitest';
import { as, fixedVendor, makeTestApp } from './helpers';

describe('items routes', () => {
  it('lists all 12 items', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/items', headers: as(1) });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(12);
    expect(res.json()[8]).toEqual({
      id: 9,
      sku: 'CAM-HD',
      name: 'HD Webcam',
      category: 'Peripherals',
      stock: 1,
      unitCostCents: 8900,
    });
  });

  it('searches by name or SKU, case-insensitively', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/items?q=monitor', headers: as(1) });
    expect(res.json().map((i: { sku: string }) => i.sku)).toEqual(['MON-27-4K', 'MON-34-UW']);
  });

  it('treats SQL in the search term as plain text', async () => {
    const { app } = makeTestApp();
    const q = encodeURIComponent("%' OR 1=1 --");
    const res = await app.inject({ method: 'GET', url: `/api/items?q=${q}`, headers: as(1) });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('gets one item and 404s for a missing one', async () => {
    const { app } = makeTestApp();
    expect(
      (await app.inject({ method: 'GET', url: '/api/items/3', headers: as(1) })).json(),
    ).toMatchObject({
      sku: 'MON-27-4K',
    });
    const missing = await app.inject({ method: 'GET', url: '/api/items/999', headers: as(1) });
    expect(missing.statusCode).toBe(404);
    expect(missing.json()).toEqual({ error: 'not_found', message: 'Item 999 not found' });
  });

  it('returns the vendor price for an item', async () => {
    const { app } = makeTestApp({ vendor: fixedVendor(4242) });
    const res = await app.inject({ method: 'GET', url: '/api/items/9/price', headers: as(1) });
    expect(res.json()).toMatchObject({ itemId: 9, unitCostCents: 4242, source: 'vendor' });
  });
});
