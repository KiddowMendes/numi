import type { Database } from 'sql.js';

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'freemium', 'premium'))
  );

  CREATE TABLE IF NOT EXISTS periods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'stokvel', 'mashonisa', 'savings')),
    balance INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'ZAR',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target_amount INTEGER NOT NULL,
    current_amount INTEGER NOT NULL DEFAULT 0,
    deadline TEXT,
    wallet_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    period_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    wallet_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (period_id) REFERENCES periods(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    date TEXT NOT NULL,
    category_id TEXT,
    wallet_id TEXT NOT NULL,
    to_wallet_id TEXT,
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (to_wallet_id) REFERENCES wallets(id)
  );

  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL
  );
`;

export const DROP_TABLES = `
  DROP TABLE IF EXISTS transactions;
  DROP TABLE IF EXISTS assignments;
  DROP TABLE IF EXISTS goals;
  DROP TABLE IF EXISTS categories;
  DROP TABLE IF EXISTS wallets;
  DROP TABLE IF EXISTS periods;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS schema_version;
`;

// sql.js helper: run a query and return all rows as objects
export function queryAll(db: Database, sql: string, params: unknown[] = []): Record<string, unknown>[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    rows.push(row);
  }
  stmt.free();
  return rows;
}

// sql.js helper: run a query and return first row or undefined
export function queryOne(db: Database, sql: string, params: unknown[] = []): Record<string, unknown> | undefined {
  return queryAll(db, sql, params)[0];
}

// sql.js helper: execute a statement (INSERT, UPDATE, DELETE, DDL)
export function execute(db: Database, sql: string, params: unknown[] = []): void {
  db.run(sql, params);
}
