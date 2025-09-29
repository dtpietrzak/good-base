/**
 * OS-specific directory utilities for good-base
 * Handles platform-specific data directories following OS conventions
 */

/**
 * Get the appropriate application data directory for the current OS
 */
export function getAppDataDirectory(appName: string = "good-base"): string {
  // Check for explicit override first
  const customDir = Deno.env.get("DATA_DIR");
  if (customDir) {
    return customDir;
  }

  // Development mode - use local tmp directory for sanity
  const isDevelopment = Deno.env.get("NODE_ENV") !== "production";
  if (isDevelopment) {
    return `./tmp/${appName}`;
  }

  // Production mode - use OS conventions
  const os = Deno.build.os;
  const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || ".";

  switch (os) {
    case "darwin": { // macOS
      return `${homeDir}/Library/Application Support/${appName}`;
    }
    
    case "linux": { // Linux
      const xdgDataHome = Deno.env.get("XDG_DATA_HOME");
      if (xdgDataHome) {
        return `${xdgDataHome}/${appName}`;
      }
      return `${homeDir}/.local/share/${appName}`;
    }
    
    case "windows": { // Windows
      const appData = Deno.env.get("APPDATA");
      if (appData) {
        return `${appData}\\${appName}`;
      }
      return `${homeDir}\\AppData\\Roaming\\${appName}`;
    }
    
    default: {
      // Fallback for unknown OS
      return `${homeDir}/.${appName}`;
    }
  }
}

/**
 * Get the standard subdirectories within the app data directory
 */
export function getAppDirectories(appName: string = "good-base") {
  const baseDir = getAppDataDirectory(appName);
  const sep = Deno.build.os === "windows" ? "\\" : "/";
  
  return {
    base: baseDir,
    data: `${baseDir}${sep}data`,
    config: `${baseDir}${sep}config`, 
    logs: `${baseDir}${sep}logs`,
    backups: `${baseDir}${sep}backups`,
    cache: `${baseDir}${sep}cache`,
  };
}

/**
 * Ensure all necessary directories exist
 */
export async function ensureAppDirectories(appName: string = "good-base"): Promise<void> {
  const dirs = getAppDirectories(appName);
  
  for (const [name, path] of Object.entries(dirs)) {
    try {
      await Deno.mkdir(path, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        console.warn(`Failed to create ${name} directory at ${path}:`, error);
      }
    }
  }
}