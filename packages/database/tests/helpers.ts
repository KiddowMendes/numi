import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { Repository } from '../src/repository.js';

let SQL: Awaited<ReturnType<typeof initSqlJs>>;

export async function ensureSqlJs(): Promise<void> {
  if (!SQL) {
    SQL = await initSqlJs();
  }
}

export function createTestDb(): { db: SqlJsDatabase; repo: Repository } {
  const db = new SQL.Database();
  const repo = new Repository(db);
  return { db, repo };
}

export function destroyTestDb(db: SqlJsDatabase): void {
  db.close();
}
