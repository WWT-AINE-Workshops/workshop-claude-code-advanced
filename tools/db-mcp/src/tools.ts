import Database from 'better-sqlite3';

type Db = Database.Database;

export function openReadOnly(file: string): Db {
  return new Database(file, { readonly: true, fileMustExist: true });
}

export function isReadOnlySql(sql: string): boolean {
  const s = sql.trim().replace(/;\s*$/, '');
  if (!s || s.includes(';')) return false;
  return /^(select|with)\b/i.test(s);
}

export function listTables(db: Db): string[] {
  return db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
    .pluck()
    .all() as string[];
}

export function describeTable(db: Db, name: string) {
  if (!listTables(db).includes(name)) throw new Error(`Unknown table: ${name}`);
  const cols = db.prepare(`PRAGMA table_info("${name}")`).all() as {
    name: string;
    type: string;
    notnull: number;
    pk: number;
  }[];
  return cols.map((c) => ({ name: c.name, type: c.type, notnull: c.notnull === 1, pk: c.pk > 0 }));
}

export function runQuery(db: Db, sql: string, limit = 200) {
  if (!isReadOnlySql(sql)) throw new Error('Only SELECT queries are allowed');
  const stmt = db.prepare(sql).raw(true);
  const columns = stmt.columns().map((c) => c.name);
  const rows: unknown[][] = [];
  let truncated = false;
  for (const row of stmt.iterate() as IterableIterator<unknown[]>) {
    if (rows.length === limit) {
      truncated = true;
      break;
    }
    rows.push(row);
  }
  return { columns, rows, truncated };
}
