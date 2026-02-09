import { describe, expect, it } from 'vitest';
import { openDb } from '../src/db';
import { seed } from '../src/seed';

function seeded() {
  const db = openDb(':memory:');
  seed(db);
  return db;
}

describe('seed', () => {
  it('creates 8 users, 12 items and 40 requests', () => {
    const db = seeded();
    const count = (t: string) => db.prepare(`SELECT COUNT(*) FROM ${t}`).pluck().get();
    expect(count('users')).toBe(8);
    expect(count('items')).toBe(12);
    expect(count('requests')).toBe(40);
  });

  it('starts every request with a creation event', () => {
    const db = seeded();
    const missing = db
      .prepare(
        `SELECT COUNT(*) FROM requests r WHERE NOT EXISTS (
           SELECT 1 FROM request_events e
           WHERE e.request_id = r.id AND e.from_status IS NULL AND e.to_status = 'pending')`,
      )
      .pluck()
      .get();
    expect(missing).toBe(0);
  });

  it('sets up the last-webcam race: two pending requests for one CAM-HD', () => {
    const db = seeded();
    const cam = db.prepare("SELECT id, stock FROM items WHERE sku = 'CAM-HD'").get();
    expect(cam).toEqual({ id: 9, stock: 1 });
    const pending = db
      .prepare(
        "SELECT id, requester_id FROM requests WHERE id IN (1, 2) AND status = 'pending' AND item_id = 9",
      )
      .all();
    expect(pending).toEqual([
      { id: 1, requester_id: 1 },
      { id: 2, requester_id: 3 },
    ]);
  });

  it('is deterministic', () => {
    const dump = () =>
      JSON.stringify(seeded().prepare('SELECT * FROM requests ORDER BY id').all()) +
      JSON.stringify(seeded().prepare('SELECT * FROM request_events ORDER BY id').all());
    expect(dump()).toBe(dump());
  });

  it('records approved cost only on approved or fulfilled requests', () => {
    const db = seeded();
    const bad = db
      .prepare(
        `SELECT COUNT(*) FROM requests WHERE
           (status IN ('approved','fulfilled') AND approved_unit_cost_cents IS NULL) OR
           (status NOT IN ('approved','fulfilled') AND approved_unit_cost_cents IS NOT NULL)`,
      )
      .pluck()
      .get();
    expect(bad).toBe(0);
  });
});
