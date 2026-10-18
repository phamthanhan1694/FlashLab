import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/** One connection per app, shared by profiles and articles and closed with Fastify. */
export class StorageDatabase {
  readonly file: string;
  private connection?: DatabaseSync;

  constructor(private readonly directory: string) {
    this.file = join(directory, 'flashlab.sqlite');
  }

  get db() {
    if (!this.connection) {
      mkdirSync(this.directory, { recursive: true });
      const db = new DatabaseSync(this.file);
      try {
        db.exec(`
          PRAGMA busy_timeout = 5000;
          PRAGMA foreign_keys = ON;
          PRAGMA journal_mode = WAL;
          PRAGMA synchronous = FULL;
          CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY, name TEXT NOT NULL,
            normalized_name TEXT NOT NULL UNIQUE, created INTEGER NOT NULL
          );
          CREATE TABLE IF NOT EXISTS profile_states (
            profile_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
            revision INTEGER NOT NULL CHECK (revision >= 0),
            data TEXT CHECK (data IS NULL OR json_valid(data))
          );
          CREATE TABLE IF NOT EXISTS articles (
            id TEXT PRIMARY KEY, revision INTEGER NOT NULL,
            document TEXT NOT NULL CHECK (json_valid(document))
          );
          CREATE TABLE IF NOT EXISTS images (
            name TEXT PRIMARY KEY, type TEXT NOT NULL, data BLOB NOT NULL
          );
          CREATE TABLE IF NOT EXISTS storage_revision (
            id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL
          );
          INSERT OR IGNORE INTO storage_revision (id, revision) VALUES (1, 0);
        `);
        for (const table of [
          'profiles',
          'profile_states',
          'articles',
          'images',
        ]) {
          for (const action of ['INSERT', 'UPDATE', 'DELETE']) {
            db.exec(`CREATE TRIGGER IF NOT EXISTS revision_${table}_${action}
              AFTER ${action} ON ${table} BEGIN
                UPDATE storage_revision SET revision = revision + 1 WHERE id = 1;
              END`);
          }
        }
        this.connection = db;
      } catch (error) {
        db.close();
        throw error;
      }
    }
    return this.connection;
  }

  transaction<T>(operation: () => T): T {
    const db = this.db;
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = operation();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  migrated(key: string) {
    return !!this.db.prepare('SELECT 1 FROM metadata WHERE key = ?').get(key);
  }

  get revision() {
    return Number(
      this.db
        .prepare('SELECT revision FROM storage_revision WHERE id = 1')
        .get()!.revision,
    );
  }

  markMigrated(key: string) {
    this.db
      .prepare('INSERT INTO metadata (key, value) VALUES (?, ?)')
      .run(key, '1');
  }

  close() {
    this.connection?.close();
    this.connection = undefined;
  }
}
