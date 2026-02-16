import { describe, expect, it } from 'vitest';
import { as, makeTestApp } from './helpers';

describe('X-User-Id auth stub', () => {
  it('lets /api/health through without a header', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });

  it.each([undefined, '', '1abc', '0', '-3', '999'])(
    'rejects header %s with 401 JSON',
    async (value) => {
      const { app } = makeTestApp();
      const headers = value === undefined ? {} : { 'x-user-id': value };
      const res = await app.inject({ method: 'GET', url: '/api/me', headers });
      expect(res.statusCode).toBe(401);
      expect(res.json()).toEqual({
        error: 'unauthorized',
        message: 'Missing or unknown X-User-Id header',
      });
    },
  );

  it('returns the current user from /api/me', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/me', headers: as(2) });
    expect(res.json()).toEqual({
      id: 2,
      name: 'Ben Okafor',
      email: 'ben.okafor@copperline.test',
      role: 'manager',
      department: 'Engineering',
    });
  });

  it('returns JSON 404 for unknown routes', async () => {
    const { app } = makeTestApp();
    const res = await app.inject({ method: 'GET', url: '/api/nope', headers: as(1) });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ error: 'not_found' });
  });
});
