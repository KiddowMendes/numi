import type { Database } from 'sql.js';
import { SCHEMA_VERSION, CREATE_TABLES, DROP_TABLES, queryOne, execute } from '../schema.js';

export function runMigrations(db: Database): void {
  db.run(CREATE_TABLES);

  const row = queryOne(db, 'SELECT version FROM schema_version LIMIT 1');

  if (!row) {
    execute(db, 'INSERT INTO schema_version (version) VALUES (?)', [SCHEMA_VERSION]);
  }
}

export function resetDatabase(db: Database): void {
  db.run(DROP_TABLES);
  runMigrations(db);
}
