import { describe, expect, it } from 'vitest';
import type { VendorClient } from '../src/vendor';
import { as, makeTestApp } from './helpers';

const slowVendor: VendorClient = {
  getPrice: (item) =>
    new Promise((resolve) =>
      setTimeout(
        () => resolve({ itemId: item.id, unitCostCents: 8900, source: 'vendor', fetchedAt: 'x' }),
        25,
      ),
    ),
};

const approve = (app: ReturnType<typeof makeTestApp>['app'], id: number) =>
  app.inject({ method: 'POST', url: `/api/requests/${id}/approve`, headers: as(2), payload: {} });

describe('overlapping approvals', () => {
  it('lets only one of two approvals take the last unit', async () => {
    const { app, db } = makeTestApp({ vendor: slowVendor });
    const res = await Promise.all([approve(app, 1), approve(app, 2)]);
    expect(res.map((r) => r.statusCode).sort()).toEqual([200, 409]);
    expect(res.find((r) => r.statusCode === 409)!.json().message).toMatch(/in stock/);
    expect(db.prepare('SELECT stock FROM items WHERE id = 9').pluck().get()).toBe(0);
    expect(
      db
        .prepare("SELECT COUNT(*) FROM requests WHERE id IN (1, 2) AND status = 'approved'")
        .pluck()
        .get(),
    ).toBe(1);
    expect(
      db
        .prepare(
          "SELECT COUNT(*) FROM request_events WHERE request_id IN (1, 2) AND to_status = 'approved'",
        )
        .pluck()
        .get(),
    ).toBe(1);
  });

  it('approves the same request only once when clicked twice', async () => {
    const { app, db } = makeTestApp({ vendor: slowVendor });
    db.prepare('UPDATE items SET stock = 5 WHERE id = 9').run();
    const res = await Promise.all([approve(app, 1), approve(app, 1)]);
    expect(res.map((r) => r.statusCode).sort()).toEqual([200, 409]);
    expect(db.prepare('SELECT stock FROM items WHERE id = 9').pluck().get()).toBe(4);
  });
});
