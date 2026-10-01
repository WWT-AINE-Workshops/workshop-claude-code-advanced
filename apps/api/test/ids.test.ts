import { describe, expect, it } from 'vitest';
import { as, makeTestApp } from './helpers';

describe('malformed ids', () => {
  it.each([
    '/api/requests/abc',
    '/api/requests/0',
    '/api/requests/1.5',
    '/api/items/abc',
    '/api/requests/abc/approve',
  ])('%s returns 400 validation_error', async (url) => {
    const { app } = makeTestApp();
    const method = url.endsWith('/approve') ? 'POST' : 'GET';
    const res = await app.inject({
      method,
      url,
      headers: as(2),
      payload: method === 'POST' ? {} : undefined,
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('validation_error');
  });

  it('still returns 404 for a well-formed id that does not exist', async () => {
    const { app } = makeTestApp();
    expect(
      (await app.inject({ method: 'GET', url: '/api/items/999', headers: as(1) })).statusCode,
    ).toBe(404);
  });
});
