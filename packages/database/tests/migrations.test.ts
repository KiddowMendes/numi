import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { ensureSqlJs, createTestDb, destroyTestDb } from './helpers.js';
import { runMigrations, resetDatabase } from '../src/migrations/index.js';
import { queryAll, queryOne, execute } from '../src/schema.js';
import type { Database as SqlJsDatabase } from 'sql.js';

beforeAll(async () => {
  await ensureSqlJs();
});

describe('Migrations', () => {
  let db: SqlJsDatabase;

  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
  });

  afterEach(() => {
    destroyTestDb(db);
  });

  it('creates all tables on first run', () => {
    const rows = queryAll(db, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const names = rows.map((r) => r.name as string);
    expect(names).toContain('users');
    expect(names).toContain('periods');
    expect(names).toContain('wallets');
    expect(names).toContain('categories');
    expect(names).toContain('goals');
    expect(names).toContain('assignments');
    expect(names).toContain('transactions');
    expect(names).toContain('schema_version');
  });

  it('writes schema version', () => {
    const row = queryOne(db, 'SELECT version FROM schema_version');
    expect(row?.version).toBe(1);
  });

  it('does not duplicate schema version on second run', () => {
    runMigrations(db);
    const rows = queryAll(db, 'SELECT version FROM schema_version');
    expect(rows).toHaveLength(1);
  });

  it('drops and recreates tables on reset', () => {
    execute(db, "INSERT INTO users (id, tier) VALUES ('test', 'free')");
    resetDatabase(db);

    const rows = queryAll(db, 'SELECT * FROM users');
    expect(rows).toHaveLength(0);
    const version = queryOne(db, 'SELECT version FROM schema_version');
    expect(version?.version).toBe(1);
  });
});
