import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

export const DB_PATH = path.join(process.cwd(), 'db', 'm3m.sqlite');

let instance: Database.Database | null = null;

/**
 * Shared read connection. The database is built by `npm run seed`; the app
 * never writes schema, only rows.
 */
export function getDb(): Database.Database {
  if (instance) return instance;

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(
      `Database not found at ${DB_PATH}. Run \`npm run seed\` to build it.`,
    );
  }

  instance = new Database(DB_PATH);
  instance.pragma('journal_mode = WAL');
  instance.pragma('foreign_keys = ON');
  return instance;
}

/** Fresh database built from schema.sql — used by the seeder and by tests. */
export function createDb(filePath: string): Database.Database {
  if (fs.existsSync(filePath)) fs.rmSync(filePath);
  for (const suffix of ['-wal', '-shm']) {
    const sidecar = filePath + suffix;
    if (fs.existsSync(sidecar)) fs.rmSync(sidecar);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.exec(fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf8'));
  db.pragma('foreign_keys = ON');
  return db;
}
