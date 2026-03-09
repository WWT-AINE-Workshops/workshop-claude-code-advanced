import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { createVendorServer, priceFor } from '../src/server';

let server: Server | undefined;

async function start(opts: Parameters<typeof createVendorServer>[0]) {
  server = createVendorServer(opts);
  await new Promise<void>((resolve) => server!.listen(0, resolve));
  return `http://127.0.0.1:${(server!.address() as AddressInfo).port}`;
}

afterEach(
  () => new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve())),
);

describe('vendor stub', () => {
  it('prices a SKU deterministically', async () => {
    const base = await start({ latencyMs: [0, 0] });
    const res = await fetch(`${base}/prices/CAM-HD`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      sku: 'CAM-HD',
      unitCostCents: priceFor('CAM-HD'),
      currency: 'USD',
    });
    expect(priceFor('CAM-HD')).toBe(priceFor('CAM-HD'));
    expect(priceFor('CAM-HD')).toBeGreaterThanOrEqual(2000);
  });

  it('rate limits after 5 requests in the window', async () => {
    let t = 1_000_000;
    const base = await start({ latencyMs: [0, 0], now: () => t });
    for (let i = 0; i < 5; i++) expect((await fetch(`${base}/prices/KB-WL`)).status).toBe(200);
    const limited = await fetch(`${base}/prices/KB-WL`);
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('10');
    t += 10_000;
    expect((await fetch(`${base}/prices/KB-WL`)).status).toBe(200);
  });

  it('returns 404 for unknown paths', async () => {
    const base = await start({ latencyMs: [0, 0] });
    expect((await fetch(`${base}/nope`)).status).toBe(404);
  });
});
