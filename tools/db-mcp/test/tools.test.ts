import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describeTable, isReadOnlySql, listTables, openReadOnly, runQuery } from '../src/tools.js';

function db() {
  const d = new Database(':memory:');
  d.exec(`CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
          INSERT INTO items (name) VALUES ('Mouse'), ('Keyboard'), ('Dock');`);
  return d;
}

describe('isReadOnlySql', () => {
  it.each([
    'SELECT 1',
    '  select * from items',
    'WITH x AS (SELECT 1) SELECT * FROM x',
    'SELECT 1;',
  ])('allows %s', (sql) => expect(isReadOnlySql(sql)).toBe(true));
  it.each([
    'DELETE FROM items',
    'UPDATE items SET name = 1',
    'SELECT 1; DROP TABLE items',
    'PRAGMA writable_schema = 1',
    '',
  ])('rejects %s', (sql) => expect(isReadOnlySql(sql)).toBe(false));
});

describe('tools', () => {
  it('lists user tables', () => expect(listTables(db())).toEqual(['items']));

  it('describes a table', () =>
    expect(describeTable(db(), 'items')).toEqual([
      { name: 'id', type: 'INTEGER', notnull: false, pk: true },
      { name: 'name', type: 'TEXT', notnull: true, pk: false },
    ]));

  it('refuses to describe an unknown table', () =>
    expect(() => describeTable(db(), 'nope; DROP TABLE items')).toThrow('Unknown table'));

  it('runs a query and truncates to the limit', () => {
    const result = runQuery(db(), 'SELECT name FROM items ORDER BY id', 2);
    expect(result).toEqual({ columns: ['name'], rows: [['Mouse'], ['Keyboard']], truncated: true });
  });

  it('refuses writes', () =>
    expect(() => runQuery(db(), 'DELETE FROM items')).toThrow('Only SELECT queries are allowed'));

  it('blocks a CTE-prefixed write on a read-only connection', () => {
    const dir = mkdtempSync(join(tmpdir(), 'db-mcp-'));
    try {
      const file = join(dir, 'test.db');
      const w = new Database(file);
      w.exec(`CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
              INSERT INTO items (name) VALUES ('Mouse'), ('Keyboard');`);
      w.close();
      const ro = openReadOnly(file);
      expect(() => runQuery(ro, 'WITH x AS (SELECT 1) DELETE FROM items')).toThrow();
      expect(() => ro.exec('DELETE FROM items')).toThrow(/readonly/);
      expect(runQuery(ro, 'SELECT COUNT(*) FROM items').rows).toEqual([[2]]);
      ro.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
