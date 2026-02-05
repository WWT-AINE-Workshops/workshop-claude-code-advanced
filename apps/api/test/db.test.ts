import { describe, expect, it } from 'vitest';
import { migrate, openDb } from '../src/db';

describe('openDb / migrate', () => {
  it('applies all migrations in order on a new database', () => {
    const db = openDb(':memory:');
    const applied = db.prepare('SELECT name FROM schema_migrations ORDER BY name').pluck().all();
    expect(applied).toEqual(['001_init.sql', '002_request_events.sql', '003_price_cache.sql']);
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .pluck()
      .all();
    expect(tables).toEqual(
      expect.arrayContaining(['items', 'price_cache', 'request_events', 'requests', 'users']),
    );
  });

  it('is idempotent', () => {
    const db = openDb(':memory:');
    expect(migrate(db)).toEqual([]);
  });

  it('enforces foreign keys', () => {
    const db = openDb(':memory:');
    expect(() =>
      db
        .prepare(
          "INSERT INTO requests (requester_id, item_id, qty, status, justification, created_at, updated_at) VALUES (99, 99, 1, 'pending', 'x', 'now', 'now')",
        )
        .run(),
    ).toThrow(/FOREIGN KEY/);
  });
});
