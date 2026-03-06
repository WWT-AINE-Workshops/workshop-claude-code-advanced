import { migrate, type Db } from './db';
import { seed } from './seed';

export function resetDatabase(db: Db): void {
  db.pragma('foreign_keys = OFF');
  try {
    db.transaction(() => {
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
        .pluck()
        .all() as string[];
      for (const name of tables) db.exec(`DROP TABLE IF EXISTS "${name}"`);
    })();
  } finally {
    db.pragma('foreign_keys = ON');
  }
  migrate(db);
  seed(db);
}
