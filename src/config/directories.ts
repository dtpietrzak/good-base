import { join } from "@std/path";
import { AppDirs, DatabaseDirs } from "./_types.ts";
import { path } from "../_utils/path.ts";

export function getBaseDir(): string {
  // check ENV vars for config path override
  // check for non-prod dev config path
  // check for default config path
  const appName = "good-base";

  // check ENV vars for config path override
  const customDir = Deno.env.get("GOOD_BASE_BASE_DIR");
  if (customDir) return customDir;

  // check for non-prod dev config path
  if (Deno.env.get("DENO_ENV") !== "production") return `./tmp/${appName}`;

  // check for default config path
  const home = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? ".";
  switch (Deno.build.os) {
    case "darwin": {
      return join(home, "Library", "Application Support", appName);
    }
    case "linux": {
      const xdg = Deno.env.get("XDG_DATA_HOME");
      return join(xdg ?? join(home, ".local", "share"), appName);
    }
    case "windows": {
      const appData = Deno.env.get("APPDATA");
      return join(appData ?? join(home, "AppData", "Roaming"), appName);
    }
    default: {
      throw new Error(`Unsupported OS: ${Deno.build.os}`);
    }
  }
}

export function getAppDirs(): AppDirs {
  const base = getBaseDir();
  return {
    base: path(base),
    config: path(base, "config"),
    logs: path(base, "logs"),
    databases: path(base, "databases"),
  };
}

export function getDatabaseDirs(
  dbPath: string,
  dbName: string,
  backupPath?: string,
): DatabaseDirs {
  const dbFullPath = path(dbPath, dbName);
  const backupFullPath = backupPath ? backupPath : path(dbFullPath, "backups");

  return {
    base: path(dbFullPath),
    data: path(dbFullPath, "data"),
    cache: path(dbFullPath, "cache"),
    logs: path(dbFullPath, "logs"),
    backups: path(backupFullPath),
  };
}

export async function ensureAppDirs(): Promise<AppDirs> {
  const dirs = getAppDirs();
  for (const [name, dirPath] of Object.entries(dirs)) {
    try {
      await Deno.mkdir(dirPath, { recursive: true });
    } catch (err) {
      if (!(err instanceof Deno.errors.AlreadyExists)) {
        console.warn(`Failed to create ${name} directory at ${dirPath}:`, err);
      }
    }
  }
  return dirs;
}

export async function ensureDatabaseDirs(
  dbPath: string,
  dbName: string,
  backupPath?: string,
): Promise<DatabaseDirs> {
  const dirs = getDatabaseDirs(dbPath, dbName, backupPath);
  for (const [name, dirPath] of Object.entries(dirs)) {
    try {
      await Deno.mkdir(dirPath as string, { recursive: true });
    } catch (err) {
      if (!(err instanceof Deno.errors.AlreadyExists)) {
        console.warn(
          `Failed to create database ${name} directory at ${dirPath}:`,
          err,
        );
      }
    }
  }
  return dirs;
}
