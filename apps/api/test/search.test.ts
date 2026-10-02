import { describe, expect, it } from 'vitest';
import { as, makeTestApp } from './helpers';

describe('search v2', () => {
  it('finds requests by item name', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/requests?q=webcam', headers: as(2) });
    expect(res.statusCode).toBe(200);
    expect(res.json().total).toBeGreaterThan(0);
  });

  it('only returns matching requests', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/requests?q=monitor&pageSize=10',
      headers: as(8),
    });
    for (const r of res.json().items) {
      expect(`${r.itemName} ${r.justification}`.toLowerCase()).toContain('monitor');
    }
  });

  it('keeps item search working', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/items?q=dock', headers: as(1) });
    expect(res.json().map((i: { sku: string }) => i.sku)).toEqual(['DOCK-USBC']);
  });
});
