import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppDeps } from '../app';
import { notFound, toId } from '../errors';
import { getItemRow, listItems, toItem } from '../repo';

const ListQuery = z.object({ q: z.string().trim().max(100).optional() });

export function itemRoutes(app: FastifyInstance, deps: AppDeps): void {
  const { db, vendor } = deps;

  app.get('/api/items', async (request) => {
    const { q } = ListQuery.parse(request.query);
    return listItems(db, q);
  });

  app.get<{ Params: { id: string } }>('/api/items/:id', async (request) => {
    const id = toId(request.params.id);
    const row = getItemRow(db, id);
    if (!row) throw notFound(`Item ${id}`);
    return toItem(row);
  });

  app.get<{ Params: { id: string } }>('/api/items/:id/price', async (request) => {
    const id = toId(request.params.id);
    const row = getItemRow(db, id);
    if (!row) throw notFound(`Item ${id}`);
    return vendor.getPrice({ id: row.id, sku: row.sku, unitCostCents: row.unit_cost_cents });
  });
}
