import { describe, expect, it } from 'vitest';
import { as, makeTestApp } from './helpers';

describe('GET /api/requests?status=', () => {
  it('returns only requests with that status, and totals match', async () => {
    const { app, db } = makeTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/requests?status=pending&pageSize=100',
      headers: as(8),
    });
    const body = res.json();
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((r: { status: string }) => r.status === 'pending')).toBe(true);
    expect(body.total).toBe(
      db.prepare("SELECT COUNT(*) FROM requests WHERE status = 'pending'").pluck().get(),
    );
  });

  it('still applies visibility', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/requests?status=pending&pageSize=100',
      headers: as(1),
    });
    expect(res.json().items.every((r: { requesterId: number }) => r.requesterId === 1)).toBe(true);
  });

  it('rejects an unknown status with 400', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/requests?status=lost',
      headers: as(1),
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('validation_error');
  });
});

describe('GET /api/requests/:id/events', () => {
  it('returns the creation event for a pending request', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/requests/1/events', headers: as(1) });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([
      expect.objectContaining({
        requestId: 1,
        actorId: 1,
        actorName: 'Ava Patel',
        fromStatus: null,
        toStatus: 'pending',
        note: null,
      }),
    ]);
  });

  it('lists transitions oldest first with the actor and note', async () => {
    const { app } = makeTestApp();
    await app.inject({
      method: 'POST',
      url: '/api/requests/1/reject',
      headers: as(2),
      payload: { note: 'No budget' },
    });
    const events = (
      await app.inject({ method: 'GET', url: '/api/requests/1/events', headers: as(1) })
    ).json();
    expect(events.map((e: { toStatus: string }) => e.toStatus)).toEqual(['pending', 'rejected']);
    expect(events[1]).toMatchObject({
      actorName: 'Ben Okafor',
      fromStatus: 'pending',
      note: 'No budget',
    });
  });

  it('hides events of requests the caller cannot see', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/requests/2/events', headers: as(1) });
    expect(res.statusCode).toBe(404);
  });
});
