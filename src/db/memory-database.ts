import type { SQLiteDatabase } from 'expo-sqlite';

type SqlValue = string | number | bigint | null;

type MemorySqlite = {
  exec(source: string): void;
  prepare(source: string): {
    run(...params: SqlValue[]): unknown;
    get(...params: SqlValue[]): unknown;
    all(...params: SqlValue[]): unknown[];
  };
};

/**
 * Jest cannot open the Expo native module. Node's built-in SQLite speaks the
 * same SQL, so persistence runs against a real in-memory database.
 */
export function memoryDatabase(): SQLiteDatabase {
  const nodeProcess = globalThis.process as {
    getBuiltinModule(id: string): { DatabaseSync: new (path: string) => MemorySqlite };
  };
  const { DatabaseSync } = nodeProcess.getBuiltinModule('node:sqlite');
  const sqlite = new DatabaseSync(':memory:');
  const bind = (params: unknown[]): SqlValue[] =>
    params.map((value) => (value === undefined ? null : (value as SqlValue)));

  const db = {
    async execAsync(source: string): Promise<void> {
      sqlite.exec(source);
    },
    async runAsync(source: string, ...params: unknown[]) {
      sqlite.prepare(source).run(...bind(params));
      return { lastInsertRowId: 0, changes: 0 };
    },
    async getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null> {
      const row = sqlite.prepare(source).get(...bind(params)) as T | undefined;
      return row ?? null;
    },
    async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
      return sqlite.prepare(source).all(...bind(params)) as T[];
    },
    async withTransactionAsync(task: () => Promise<void>): Promise<void> {
      sqlite.exec('BEGIN');
      try {
        await task();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };

  return db as unknown as SQLiteDatabase;
}
