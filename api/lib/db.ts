import { access, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, '../data');
const sqlitePath = path.resolve(dataDirectory, 'karras.sqlite');
const legacyJsonPath = path.resolve(dataDirectory, 'db.json');

let databasePromise: ReturnType<typeof open> | null = null;

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = open({
      filename: sqlitePath,
      driver: sqlite3.Database,
    });
  }

  const database = await databasePromise;

  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );
  `);

  await migrateLegacyJson(database);

  return database;
}

let migratedLegacyJson = false;

async function migrateLegacyJson(database: Awaited<ReturnType<typeof open>>) {
  if (migratedLegacyJson) {
    return;
  }

  migratedLegacyJson = true;
  await mkdir(dataDirectory, { recursive: true });

  try {
    await access(legacyJsonPath);
  } catch {
    return;
  }

  const raw = await readFile(legacyJsonPath, 'utf8');
  const legacy = JSON.parse(raw) as {
    users?: Array<{ id: string; email: string; name: string; passwordHash: string }>;
    scenarios?: Array<Record<string, unknown> & { id: string; ownerId: string }>;
  };

  if (legacy.users?.length) {
    for (const user of legacy.users) {
      await database.run(
        `INSERT OR IGNORE INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)`,
        [user.id, user.email, user.name, user.passwordHash],
      );
    }
  }

  if (legacy.scenarios?.length) {
    for (const scenario of legacy.scenarios) {
      const { id, ownerId, ...payload } = scenario;
      await database.run(
        `INSERT OR IGNORE INTO scenarios (id, owner_id, payload_json, updated_at) VALUES (?, ?, ?, ?)`,
        [id, ownerId, JSON.stringify({ id, ...payload }), new Date().toISOString()],
      );
    }
  }
}
