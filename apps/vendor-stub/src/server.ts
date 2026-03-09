import { createServer, type Server } from 'node:http';

export interface VendorOptions {
  latencyMs?: [number, number];
  limit?: number;
  windowMs?: number;
  now?: () => number;
}

export function priceFor(sku: string): number {
  let h = 0;
  for (const c of sku) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 2_000 + (h % 298_000);
}

export function createVendorServer(opts: VendorOptions = {}): Server {
  const [minLatency, maxLatency] = opts.latencyMs ?? [300, 800];
  const limit = opts.limit ?? 5;
  const windowMs = opts.windowMs ?? 10_000;
  const now = opts.now ?? Date.now;
  let hits: number[] = [];

  return createServer((req, res) => {
    const send = (status: number, body: unknown, headers: Record<string, string> = {}) => {
      res.writeHead(status, { 'content-type': 'application/json', ...headers });
      res.end(JSON.stringify(body));
    };
    const match = /^\/prices\/([A-Za-z0-9-]+)$/.exec(req.url ?? '');
    if (req.method !== 'GET' || !match) return send(404, { error: 'not_found' });

    const t = now();
    hits = hits.filter((h) => t - h < windowMs);
    if (hits.length >= limit) {
      const retry = Math.ceil((windowMs - (t - hits[0])) / 1000);
      return send(429, { error: 'rate_limited' }, { 'retry-after': String(retry) });
    }
    hits.push(t);

    const delay = minLatency + Math.random() * (maxLatency - minLatency);
    setTimeout(
      () => send(200, { sku: match[1], unitCostCents: priceFor(match[1]), currency: 'USD' }),
      delay,
    );
  });
}
