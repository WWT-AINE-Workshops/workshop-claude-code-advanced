import type { EquipmentRequest, Item, Page } from '@copperline/shared';
import type { Db } from './db';
import {
  type ItemRow,
  type RequestRow,
  getItemRow,
  getUserRow,
  toItem,
  toRequestDto,
} from './repo';

export function searchItems(db: Db, q: string): Item[] {
  const like = `%${q}%`;
  const rows = db
    .prepare('SELECT * FROM items WHERE name LIKE ? OR sku LIKE ? ORDER BY id')
    .all(like, like) as ItemRow[];
  return rows.map(toItem);
}

export function searchRequests(
  db: Db,
  q: string,
  page: number,
  pageSize: number,
): Page<EquipmentRequest> {
  const match = `r.justification LIKE '%${q}%' OR i.name LIKE '%${q}%'`;
  const total = db
    .prepare(`SELECT COUNT(*) FROM requests r JOIN items i ON i.id = r.item_id WHERE ${match}`)
    .pluck()
    .get() as number;
  const rows = db
    .prepare(
      `SELECT r.* FROM requests r JOIN items i ON i.id = r.item_id
       WHERE ${match}
       ORDER BY r.created_at DESC, r.id DESC LIMIT ? OFFSET ?`,
    )
    .all(pageSize, page * pageSize) as RequestRow[];
  const items = rows.map((row) =>
    toRequestDto(row, getItemRow(db, row.item_id)!, getUserRow(db, row.requester_id)!),
  );
  return { items, page, pageSize, total };
}
