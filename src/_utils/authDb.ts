import { DatabaseSync, StatementSync } from "node:sqlite";

let statements: {
  add: StatementSync;
  remove: StatementSync;
  has: StatementSync;
  list: StatementSync;
} | null = null;

const initializeStatements = (db: DatabaseSync) => {
  statements = {
    add: db.prepare("INSERT OR IGNORE INTO auth (uuid) VALUES (?)"),
    remove: db.prepare("DELETE FROM auth WHERE uuid = ?"),
    has: db.prepare(
      "SELECT EXISTS(SELECT 1 FROM auth WHERE uuid = ?) AS count",
    ),
    list: db.prepare("SELECT uuid FROM auth LIMIT ? OFFSET ?"),
  };
};

const getStatements = () => {
  if (!statements) {
    throw new Error("Auth DB not initialized. Call initializeAuthDb() first.");
  }
  return statements;
};

let authDb: DatabaseSync | null = null;

export const initializeAuthDb = (path: string) => {
  if (authDb) {
    throw new Error("Auth DB already initialized.");
  }
  authDb = new DatabaseSync(path);
  authDb.exec(`CREATE TABLE IF NOT EXISTS auth (uuid TEXT PRIMARY KEY)`);
  initializeStatements(authDb);
};

const addAuthRecord = (uuid: string): boolean => {
  const stmt = getStatements().add;
  const did = stmt.run(uuid);
  return did.changes > 0;
};

const removeAuthRecord = (uuid: string): boolean => {
  const stmt = getStatements().remove;
  const did = stmt.run(uuid);
  return did.changes > 0;
};

const hasAuthRecord = (uuid: string): boolean => {
  const stmt = getStatements().has;
  const result = stmt.get(uuid) as { count: number };
  return result.count > 0;
};

const listAuthRecords = (limit: number = 10, offset: number = 0): string[] => {
  const stmt = getStatements().list;
  const rows = stmt.all(limit, offset) as { uuid: string }[];
  return rows.map((row) => row.uuid);
};

export const getAuthDb = () => {
  if (!authDb) {
    throw new Error("Auth DB not initialized. Call initializeAuthDb() first.");
  }
  return {
    add: addAuthRecord,
    remove: removeAuthRecord,
    has: hasAuthRecord,
    list: listAuthRecords,
  };
};
