import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { runMigrations, resetDatabase } from '../src/migrations/index.js';
import { SCHEMA_VERSION } from '../src/schema.js';

describe('Migrations', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('creates all tables', () => {
    runMigrations(db);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all()
      .map((r: Record<string, unknown>) => r.name as string);

    expect(tables).toContain('users');
    expect(tables).toContain('periods');
    expect(tables).toContain('wallets');
    expect(tables).toContain('categories');
    expect(tables).toContain('goals');
    expect(tables).toContain('assignments');
    expect(tables).toContain('transactions');
    expect(tables).toContain('schema_version');
  });

  it('records schema version', () => {
    runMigrations(db);
    const row = db.prepare('SELECT version FROM schema_version LIMIT 1').get() as {
      version: number;
    };
    expect(row.version).toBe(SCHEMA_VERSION);
  });

  it('does not duplicate schema_version on re-run', () => {
    runMigrations(db);
    runMigrations(db);
    const count = db.prepare('SELECT COUNT(*) as count FROM schema_version').get() as {
      count: number;
    };
    expect(count.count).toBe(1);
  });

  it('resetDatabase drops and recreates tables', () => {
    runMigrations(db);
    db.prepare("INSERT INTO users (id, tier) VALUES ('u1', 'free')").run();
    resetDatabase(db);

    const row = db.prepare('SELECT * FROM users').all();
    expect(row).toHaveLength(0);

    const versionRow = db.prepare('SELECT version FROM schema_version LIMIT 1').get() as {
      version: number;
    };
    expect(versionRow.version).toBe(SCHEMA_VERSION);
  });

  it('enforces foreign key constraints', () => {
    runMigrations(db);

    expect(() => {
      db.prepare(
        "INSERT INTO goals (id, name, target_amount, current_amount, deadline, wallet_id, created_at) VALUES ('g1', 'Test', 100, 0, NULL, 'nonexistent', '2025-01-06T00:00:00.000Z')",
      ).run();
    }).toThrow();
  });

  it('enforces CHECK constraints on user tier', () => {
    runMigrations(db);

    expect(() => {
      db.prepare("INSERT INTO users (id, tier) VALUES ('u1', 'invalid')").run();
    }).toThrow();
  });

  it('enforces CHECK constraints on wallet type', () => {
    runMigrations(db);

    expect(() => {
      db.prepare(
        "INSERT INTO wallets (id, name, type, balance, currency, created_at) VALUES ('w1', 'Test', 'invalid', 0, 'ZAR', '2025-01-06T00:00:00.000Z')",
      ).run();
    }).toThrow();
  });

  it('enforces CHECK constraints on transaction type', () => {
    runMigrations(db);

    expect(() => {
      db.prepare(
        "INSERT INTO transactions (id, amount, type, date, category_id, wallet_id, to_wallet_id, note, created_at) VALUES ('t1', 100, 'invalid', '2025-01-07T00:00:00.000Z', NULL, 'w1', NULL, NULL, '2025-01-07T00:00:00.000Z')",
      ).run();
    }).toThrow();
  });
});
