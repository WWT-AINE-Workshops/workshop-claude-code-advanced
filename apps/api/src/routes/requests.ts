import type { RequestStatus, User } from '@copperline/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppDeps } from '../app';
import type { Db } from '../db';
import { HttpError, conflict, forbidden, notFound, toId } from '../errors';
import {
  type RequestRow,
  getItemRow,
  getRequestDto,
  getRequestRow,
  getUserRow,
  insertEvent,
  listPendingForApprover,
  listVisibleRequests,
} from '../repo';

const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const CreateBody = z.object({
  itemId: z.number().int().positive(),
  qty: z.number().int().min(1).max(10),
  justification: z.string().trim().min(10).max(500),
});

const RejectBody = z.object({ note: z.string().trim().max(500).optional() }).default({});

function canView(db: Db, user: User, row: RequestRow): boolean {
  if (user.role === 'admin' || row.requester_id === user.id) return true;
  return (
    user.role === 'manager' && getUserRow(db, row.requester_id)!.department === user.department
  );
}

function requireVisible(db: Db, user: User, id: number): RequestRow {
  const row = getRequestRow(db, id);
  if (!row || !canView(db, user, row)) throw notFound(`Request ${id}`);
  return row;
}

function assertCanDecide(db: Db, user: User, row: RequestRow): void {
  if (row.requester_id === user.id) throw forbidden();
  const sameDept = getUserRow(db, row.requester_id)!.department === user.department;
  if (!(user.role === 'admin' || (user.role === 'manager' && sameDept))) throw forbidden();
}

function assertPending(row: RequestRow): void {
  if (row.status !== 'pending') throw conflict(`Request ${row.id} is ${row.status}, not pending`);
}

export function requestRoutes(app: FastifyInstance, deps: AppDeps): void {
  const { db, vendor } = deps;

  const transition = (row: RequestRow, actor: User, to: RequestStatus, note: string | null) => {
    const at = new Date().toISOString();
    db.transaction(() => {
      db.prepare('UPDATE requests SET status = ?, updated_at = ? WHERE id = ?').run(to, at, row.id);
      insertEvent(db, { requestId: row.id, actorId: actor.id, from: row.status, to, note, at });
    })();
    return getRequestDto(db, row.id)!;
  };

  app.get('/api/requests', async (request) => {
    const { page, pageSize } = ListQuery.parse(request.query);
    return listVisibleRequests(db, request.user, page, pageSize);
  });

  app.get<{ Params: { id: string } }>('/api/requests/:id', async (request) => {
    const id = toId(request.params.id);
    requireVisible(db, request.user, id);
    return getRequestDto(db, id)!;
  });

  app.post('/api/requests', async (request, reply) => {
    const body = CreateBody.parse(request.body);
    if (!getItemRow(db, body.itemId)) {
      throw new HttpError(400, 'validation_error', `itemId: item ${body.itemId} does not exist`);
    }
    const at = new Date().toISOString();
    const id = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO requests (requester_id, item_id, qty, status, justification, created_at, updated_at)
           VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
        )
        .run(request.user.id, body.itemId, body.qty, body.justification, at, at);
      const newId = Number(result.lastInsertRowid);
      insertEvent(db, {
        requestId: newId,
        actorId: request.user.id,
        from: null,
        to: 'pending',
        note: null,
        at,
      });
      return newId;
    })();
    return reply.code(201).send(getRequestDto(db, id));
  });

  app.post<{ Params: { id: string } }>('/api/requests/:id/approve', async (request) => {
    const id = toId(request.params.id);
    const row = requireVisible(db, request.user, id);
    assertCanDecide(db, request.user, row);
    assertPending(row);

    const item = getItemRow(db, row.item_id)!;
    if (item.stock < row.qty) throw conflict(`Only ${item.stock} of ${item.name} in stock`);

    const price = await vendor.getPrice({
      id: item.id,
      sku: item.sku,
      unitCostCents: item.unit_cost_cents,
    });

    const at = new Date().toISOString();
    db.transaction(() => {
      db.prepare('UPDATE items SET stock = stock - ? WHERE id = ?').run(row.qty, item.id);
      db.prepare(
        "UPDATE requests SET status = 'approved', approved_unit_cost_cents = ?, updated_at = ? WHERE id = ?",
      ).run(price.unitCostCents, at, id);
      insertEvent(db, {
        requestId: id,
        actorId: request.user.id,
        from: 'pending',
        to: 'approved',
        note: null,
        at,
      });
    })();
    return getRequestDto(db, id)!;
  });

  app.post<{ Params: { id: string } }>('/api/requests/:id/reject', async (request) => {
    const id = toId(request.params.id);
    const { note } = RejectBody.parse(request.body ?? {});
    const row = requireVisible(db, request.user, id);
    assertCanDecide(db, request.user, row);
    assertPending(row);
    return transition(row, request.user, 'rejected', note ?? null);
  });

  app.post<{ Params: { id: string } }>('/api/requests/:id/cancel', async (request) => {
    const id = toId(request.params.id);
    const row = requireVisible(db, request.user, id);
    if (row.requester_id !== request.user.id) throw forbidden();
    assertPending(row);
    return transition(row, request.user, 'cancelled', null);
  });

  app.get('/api/approvals', async (request) => {
    if (request.user.role === 'employee') throw forbidden();
    return listPendingForApprover(db, request.user);
  });
}
