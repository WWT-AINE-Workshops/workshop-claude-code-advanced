import type {
  DashboardSummary,
  EquipmentRequest,
  Item,
  Page,
  RequestEvent,
  RequestStatus,
  Role,
  User,
} from '@copperline/shared';
import type { Db } from './db';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export const toUser = (row: UserRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  department: row.department,
});

export function getUserRow(db: Db, id: number): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

export function listUsers(db: Db): User[] {
  return (db.prepare('SELECT * FROM users ORDER BY id').all() as UserRow[]).map(toUser);
}

export function visibility(user: User): { sql: string; params: unknown[] } {
  if (user.role === 'admin') return { sql: '1 = 1', params: [] };
  if (user.role === 'manager') return { sql: 'u.department = ?', params: [user.department] };
  return { sql: 'r.requester_id = ?', params: [user.id] };
}

export function dashboardSummary(db: Db, user: User, now: Date): DashboardSummary {
  const v = visibility(user);
  const month = now.toISOString().slice(0, 7);
  const visibleCount = (extra: string, ...params: unknown[]) =>
    db
      .prepare(
        `SELECT COUNT(*) FROM requests r JOIN users u ON u.id = r.requester_id WHERE ${v.sql} AND ${extra}`,
      )
      .pluck()
      .get(...v.params, ...params) as number;
  return {
    pendingCount: visibleCount("r.status = 'pending'"),
    approvedThisMonth: visibleCount("r.status = 'approved' AND r.updated_at LIKE ?", `${month}%`),
    lowStockItems: db
      .prepare('SELECT COUNT(*) FROM items WHERE stock <= 2')
      .pluck()
      .get() as number,
    myOpenRequests: db
      .prepare("SELECT COUNT(*) FROM requests WHERE requester_id = ? AND status = 'pending'")
      .pluck()
      .get(user.id) as number,
  };
}

export interface ItemRow {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unit_cost_cents: number;
}

export const toItem = (row: ItemRow): Item => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  category: row.category,
  stock: row.stock,
  unitCostCents: row.unit_cost_cents,
});

export function getItemRow(db: Db, id: number): ItemRow | undefined {
  return db.prepare('SELECT * FROM items WHERE id = ?').get(id) as ItemRow | undefined;
}

export function listItems(db: Db, q?: string): Item[] {
  if (!q) return (db.prepare('SELECT * FROM items ORDER BY id').all() as ItemRow[]).map(toItem);
  const like = `%${q}%`;
  const rows = db
    .prepare('SELECT * FROM items WHERE name LIKE ? OR sku LIKE ? ORDER BY id')
    .all(like, like) as ItemRow[];
  return rows.map(toItem);
}

export interface RequestRow {
  id: number;
  requester_id: number;
  item_id: number;
  qty: number;
  status: RequestStatus;
  justification: string;
  approved_unit_cost_cents: number | null;
  created_at: string;
  updated_at: string;
}

export const toRequestDto = (row: RequestRow, item: ItemRow, user: UserRow): EquipmentRequest => ({
  id: row.id,
  requesterId: row.requester_id,
  requesterName: user.name,
  department: user.department,
  itemId: row.item_id,
  itemName: item.name,
  qty: row.qty,
  status: row.status,
  justification: row.justification,
  approvedUnitCostCents: row.approved_unit_cost_cents,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function getRequestRow(db: Db, id: number): RequestRow | undefined {
  return db.prepare('SELECT * FROM requests WHERE id = ?').get(id) as RequestRow | undefined;
}

export function getRequestDto(db: Db, id: number): EquipmentRequest | undefined {
  const row = getRequestRow(db, id);
  if (!row) return undefined;
  return toRequestDto(row, getItemRow(db, row.item_id)!, getUserRow(db, row.requester_id)!);
}

export function listVisibleRequests(
  db: Db,
  user: User,
  page: number,
  pageSize: number,
  status?: RequestStatus,
): Page<EquipmentRequest> {
  const v = visibility(user);
  const where = status ? `${v.sql} AND r.status = ?` : v.sql;
  const params = status ? [...v.params, status] : v.params;
  const total = db
    .prepare(`SELECT COUNT(*) FROM requests r JOIN users u ON u.id = r.requester_id WHERE ${where}`)
    .pluck()
    .get(...params) as number;
  const rows = db
    .prepare(
      `SELECT r.* FROM requests r JOIN users u ON u.id = r.requester_id
       WHERE ${where} ORDER BY r.created_at DESC, r.id DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, (page - 1) * pageSize) as RequestRow[];
  const items = rows.map((row) =>
    toRequestDto(row, getItemRow(db, row.item_id)!, getUserRow(db, row.requester_id)!),
  );
  return { items, page, pageSize, total };
}

export function listPendingForApprover(db: Db, user: User): EquipmentRequest[] {
  const rows = db
    .prepare(
      `SELECT r.* FROM requests r JOIN users u ON u.id = r.requester_id
       WHERE r.status = 'pending' AND r.requester_id <> ? AND (? = 'admin' OR u.department = ?)
       ORDER BY r.created_at ASC, r.id ASC`,
    )
    .all(user.id, user.role, user.department) as RequestRow[];
  return rows.map((row) =>
    toRequestDto(row, getItemRow(db, row.item_id)!, getUserRow(db, row.requester_id)!),
  );
}

export function insertEvent(
  db: Db,
  e: {
    requestId: number;
    actorId: number;
    from: RequestStatus | null;
    to: RequestStatus;
    note: string | null;
    at: string;
  },
): void {
  db.prepare(
    'INSERT INTO request_events (request_id, actor_id, from_status, to_status, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(e.requestId, e.actorId, e.from, e.to, e.note, e.at);
}

interface EventRow {
  id: number;
  request_id: number;
  actor_id: number;
  actor_name: string;
  from_status: RequestStatus | null;
  to_status: RequestStatus;
  note: string | null;
  created_at: string;
}

export function listRequestEvents(db: Db, requestId: number): RequestEvent[] {
  const rows = db
    .prepare(
      `SELECT e.id, e.request_id, e.actor_id, u.name AS actor_name, e.from_status, e.to_status, e.note, e.created_at
       FROM request_events e JOIN users u ON u.id = e.actor_id
       WHERE e.request_id = ? ORDER BY e.created_at ASC, e.id ASC`,
    )
    .all(requestId) as EventRow[];
  return rows.map((r) => ({
    id: r.id,
    requestId: r.request_id,
    actorId: r.actor_id,
    actorName: r.actor_name,
    fromStatus: r.from_status,
    toStatus: r.to_status,
    note: r.note,
    createdAt: r.created_at,
  }));
}
