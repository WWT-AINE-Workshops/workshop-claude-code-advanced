import { describe, expect, it } from 'vitest';
import { openDb } from '../src/db';
import { resetDatabase } from '../src/reset';
import { seed } from '../src/seed';

describe('resetDatabase', () => {
  it('restores seed data on the same open connection', () => {
    const db = openDb(':memory:');
    seed(db);
    const count = (t: string) => db.prepare(`SELECT COUNT(*) FROM ${t}`).pluck().get();

    db.prepare("UPDATE items SET stock = 0 WHERE sku = 'CAM-HD'").run();
    db.prepare("UPDATE requests SET status = 'approved' WHERE id = 1").run();
    db.prepare(
      `INSERT INTO requests (requester_id, item_id, qty, status, justification, created_at, updated_at)
       VALUES (1, 9, 1, 'pending', 'extra', '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z')`,
    ).run();
    expect(count('requests')).toBe(41);

    resetDatabase(db);

    expect(count('users')).toBe(8);
    expect(count('items')).toBe(12);
    expect(count('requests')).toBe(40);
    expect(db.prepare("SELECT stock FROM items WHERE sku = 'CAM-HD'").pluck().get()).toBe(1);
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1);
  });
});
