import Database from 'better-sqlite3';
import { Repository } from '../src/repository.js';

export function createTestDb(): { db: Database.Database; repo: Repository } {
  const db = new Database(':memory:');
  const repo = new Repository(db);
  return { db, repo };
}
