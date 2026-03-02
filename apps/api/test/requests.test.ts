import { describe, expect, it } from 'vitest';
import type { VendorClient } from '../src/vendor';
import { as, makeTestApp } from './helpers';

const count = (db: ReturnType<typeof makeTestApp>['db'], sql: string, ...p: unknown[]) =>
  db
    .prepare(sql)
    .pluck()
    .get(...p) as number;

describe('GET /api/requests', () => {
  it('shows an employee only their own requests, newest first', async () => {
    const { app, db } = makeTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/requests?pageSize=100',
      headers: as(1),
    });
    const body = res.json();
    expect(body.total).toBe(count(db, 'SELECT COUNT(*) FROM requests WHERE requester_id = 1'));
    expect(body.items.every((r: { requesterId: number }) => r.requesterId === 1)).toBe(true);
    const created = body.items.map((r: { createdAt: string }) => r.createdAt);
    expect(created).toEqual([...created].sort().reverse());
  });

  it('shows a manager their whole department', async () => {
    const { app, db } = makeTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/requests?pageSize=100',
      headers: as(2),
    });
    expect(res.json().total).toBe(
      count(
        db,
        "SELECT COUNT(*) FROM requests r JOIN users u ON u.id = r.requester_id WHERE u.department = 'Engineering'",
      ),
    );
  });

  it('paginates with 1-based pages and an empty page past the end', async () => {
    const { app } = makeTestApp();
    const p1 = (
      await app.inject({ method: 'GET', url: '/api/requests?page=1&pageSize=5', headers: as(8) })
    ).json();
    const p2 = (
      await app.inject({ method: 'GET', url: '/api/requests?page=2&pageSize=5', headers: as(8) })
    ).json();
    expect(p1).toMatchObject({ page: 1, pageSize: 5, total: 40 });
    expect(p1.items).toHaveLength(5);
    expect(p2.items[0].id).not.toBe(p1.items[0].id);
    expect(p1.items.map((r: { id: number }) => r.id)).not.toContain(p2.items[0].id);
    const past = (
      await app.inject({ method: 'GET', url: '/api/requests?page=999', headers: as(8) })
    ).json();
    expect(past).toMatchObject({ items: [], page: 999, total: 40 });
  });

  it('rejects an out-of-range pageSize with 400', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/requests?pageSize=500',
      headers: as(1),
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('validation_error');
  });

  it('includes item and requester names', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/requests/1', headers: as(1) });
    expect(res.json()).toMatchObject({
      id: 1,
      requesterName: 'Ava Patel',
      department: 'Engineering',
      itemName: 'HD Webcam',
      status: 'pending',
    });
  });
});

describe('GET /api/requests/:id visibility', () => {
  it('hides other people’s requests from an employee with 404', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/requests/2', headers: as(1) });
    expect(res.statusCode).toBe(404);
  });

  it('hides other departments from a manager with 404', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/requests/1', headers: as(5) });
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/requests', () => {
  it('creates a pending request and records a creation event', async () => {
    const { app, db } = makeTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/requests',
      headers: as(4),
      payload: { itemId: 3, qty: 1, justification: 'Second monitor for the sales floor.' },
    });
    expect(res.statusCode).toBe(201);
    const created = res.json();
    expect(created).toMatchObject({ requesterId: 4, itemId: 3, qty: 1, status: 'pending' });
    expect(
      count(
        db,
        "SELECT COUNT(*) FROM request_events WHERE request_id = ? AND to_status = 'pending'",
        created.id,
      ),
    ).toBe(1);
  });

  it.each([
    [{ itemId: 3, qty: 0, justification: 'Second monitor for the sales floor.' }],
    [{ itemId: 3, qty: 1, justification: 'short' }],
    [{ qty: 1, justification: 'Second monitor for the sales floor.' }],
  ])('rejects invalid body %j with 400', async (payload) => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'POST', url: '/api/requests', headers: as(4), payload });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('validation_error');
  });

  it('rejects an unknown item with 400', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/requests',
      headers: as(4),
      payload: { itemId: 999, qty: 1, justification: 'Second monitor for the sales floor.' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 JSON for malformed JSON and for a missing body', async () => {
    const { app } = makeTestApp();
    const bad = await app.inject({
      method: 'POST',
      url: '/api/requests',
      headers: { ...as(4), 'content-type': 'application/json' },
      payload: '{"itemId": 3,',
    });
    expect(bad.statusCode).toBe(400);
    expect(bad.json()).toHaveProperty('error');
    const empty = await app.inject({ method: 'POST', url: '/api/requests', headers: as(4) });
    expect(empty.statusCode).toBe(400);
    expect(empty.json()).toHaveProperty('error');
  });
});

describe('approve / reject / cancel', () => {
  it('lets the department manager approve: stock drops, cost and event recorded', async () => {
    const { app, db } = makeTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/requests/1/approve',
      headers: as(2),
      payload: {},
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'approved', approvedUnitCostCents: 1234 });
    expect(count(db, 'SELECT stock FROM items WHERE id = 9')).toBe(0);
    expect(
      count(
        db,
        "SELECT COUNT(*) FROM request_events WHERE request_id = 1 AND to_status = 'approved' AND actor_id = 2",
      ),
    ).toBe(1);
  });

  it('still approves when the vendor falls back to the catalog price', async () => {
    const fallback: VendorClient = {
      getPrice: async (item) => ({
        itemId: item.id,
        unitCostCents: item.unitCostCents,
        source: 'fallback',
        fetchedAt: 'x',
      }),
    };
    const { app } = makeTestApp({ vendor: fallback });
    const res = await app.inject({
      method: 'POST',
      url: '/api/requests/1/approve',
      headers: as(2),
      payload: {},
    });
    expect(res.json()).toMatchObject({ status: 'approved', approvedUnitCostCents: 8900 });
  });

  it('refuses a second sequential approval when stock has run out', async () => {
    const { app } = makeTestApp();
    await app.inject({
      method: 'POST',
      url: '/api/requests/1/approve',
      headers: as(2),
      payload: {},
    });
    const second = await app.inject({
      method: 'POST',
      url: '/api/requests/2/approve',
      headers: as(2),
      payload: {},
    });
    expect(second.statusCode).toBe(409);
    expect(second.json().message).toMatch(/in stock/);
  });

  it('hides other people’s requests from employees (404) and lets the admin approve anything', async () => {
    const { app } = makeTestApp();
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/requests/2/approve',
          headers: as(1),
          payload: {},
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/requests/1/approve',
          headers: as(8),
          payload: {},
        })
      ).statusCode,
    ).toBe(200);
  });

  it('returns 403 when the requester is visible but not allowed to decide', async () => {
    const { app } = makeTestApp();
    const own = await app.inject({
      method: 'POST',
      url: '/api/requests/1/approve',
      headers: as(1),
      payload: {},
    });
    expect(own.statusCode).toBe(403);
  });

  it('returns 409 when the request is no longer pending', async () => {
    const { app } = makeTestApp();
    await app.inject({
      method: 'POST',
      url: '/api/requests/1/reject',
      headers: as(2),
      payload: { note: 'No budget' },
    });
    const again = await app.inject({
      method: 'POST',
      url: '/api/requests/1/approve',
      headers: as(2),
      payload: {},
    });
    expect(again.statusCode).toBe(409);
  });

  it('records the rejection note', async () => {
    const { app, db } = makeTestApp();
    await app.inject({
      method: 'POST',
      url: '/api/requests/1/reject',
      headers: as(2),
      payload: { note: 'No budget' },
    });
    expect(
      db
        .prepare("SELECT note FROM request_events WHERE request_id = 1 AND to_status = 'rejected'")
        .pluck()
        .get(),
    ).toBe('No budget');
  });

  it('lets only the requester cancel', async () => {
    const { app } = makeTestApp();
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/api/requests/1/cancel',
          headers: as(2),
          payload: {},
        })
      ).statusCode,
    ).toBe(403);
    const ok = await app.inject({
      method: 'POST',
      url: '/api/requests/1/cancel',
      headers: as(1),
      payload: {},
    });
    expect(ok.json()).toMatchObject({ status: 'cancelled' });
  });
});

describe('GET /api/approvals', () => {
  it('lists pending requests in the manager’s department, excluding their own', async () => {
    const { app, db } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/approvals', headers: as(2) });
    const expected = count(
      db,
      "SELECT COUNT(*) FROM requests r JOIN users u ON u.id = r.requester_id WHERE u.department = 'Engineering' AND r.status = 'pending' AND r.requester_id <> 2",
    );
    expect(res.json()).toHaveLength(expected);
    expect(res.json().map((r: { id: number }) => r.id)).toEqual(expect.arrayContaining([1, 2]));
  });

  it('is forbidden to employees', async () => {
    const { app } = makeTestApp();
    expect(
      (await app.inject({ method: 'GET', url: '/api/approvals', headers: as(1) })).statusCode,
    ).toBe(403);
  });
});
