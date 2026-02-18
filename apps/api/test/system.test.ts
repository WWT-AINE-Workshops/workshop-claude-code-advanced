import { describe, expect, it } from 'vitest';
import { as, makeTestApp } from './helpers';

describe('GET /api/users', () => {
  it('lists all 8 demo users for the user switcher', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/users', headers: as(1) });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(8);
    expect(res.json()[0]).toMatchObject({ id: 1, name: 'Ava Patel' });
  });
});

describe('GET /api/dashboard', () => {
  const september = () => new Date('2026-09-20T12:00:00.000Z');

  it('summarizes what an employee can see', async () => {
    const { app, db } = makeTestApp({ now: september });
    const res = await app.inject({ method: 'GET', url: '/api/dashboard', headers: as(1) });
    const own = (status: string) =>
      db
        .prepare('SELECT COUNT(*) FROM requests WHERE requester_id = 1 AND status = ?')
        .pluck()
        .get(status);
    expect(res.json()).toEqual({
      pendingCount: own('pending'),
      approvedThisMonth: db
        .prepare(
          "SELECT COUNT(*) FROM requests WHERE requester_id = 1 AND status = 'approved' AND updated_at LIKE '2026-09%'",
        )
        .pluck()
        .get(),
      lowStockItems: db.prepare('SELECT COUNT(*) FROM items WHERE stock <= 2').pluck().get(),
      myOpenRequests: own('pending'),
    });
  });

  it('counts the whole department for a manager', async () => {
    const { app, db } = makeTestApp({ now: september });
    const res = await app.inject({ method: 'GET', url: '/api/dashboard', headers: as(2) });
    const deptPending = db
      .prepare(
        "SELECT COUNT(*) FROM requests r JOIN users u ON u.id = r.requester_id WHERE u.department = 'Engineering' AND r.status = 'pending'",
      )
      .pluck()
      .get();
    expect(res.json().pendingCount).toBe(deptPending);
  });
});
