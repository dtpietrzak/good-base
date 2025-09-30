import { join } from "jsr:@std/path";
import { AppDirs } from "./_types.ts";

export function getAppBaseDir(appName = "good-base"): string {
  // Explicit override
  const customDir = Deno.env.get("DATA_DIR");
  if (customDir) return customDir;

  if (Deno.env.get("DENO_ENV") !== "production") return `./tmp/${appName}`;

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

export function getAppDirs(appName = "good-base"): AppDirs {
  const base = getAppBaseDir(appName);
  return {
    base,
    data: join(base, "data"),
    config: join(base, "config"),
    cache: join(base, "cache"),
    logs: join(base, "logs"),
    backups: join(base, "backups"),
  };
}

export async function ensureAppDirs(appName = "good-base"): Promise<AppDirs> {
  const dirs = getAppDirs(appName);
  for (const [name, path] of Object.entries(dirs)) {
    try {
      await Deno.mkdir(path, { recursive: true });
    } catch (err) {
      if (!(err instanceof Deno.errors.AlreadyExists)) {
        console.warn(`Failed to create ${name} directory at ${path}:`, err);
      }
    }
  }
  return dirs;
}
