import type { GoodBaseConfig } from "./types.ts";

/** 
 * Get default configuration with OS-appropriate directories
 * This function is called at runtime to provide smart defaults
 */
export async function getDefaultConfig(): Promise<GoodBaseConfig> {
  // Import here to avoid circular dependencies and allow runtime resolution
  const { getAppDirectories } = await import("./directories.ts");
  const dirs = getAppDirectories("good-base");

  return {
    database: {
      dataDirectory: dirs.data,
      maxFileSize: 100, // 100MB
      enableBackups: true,
      backupDirectory: dirs.backups,
      backupInterval: 24, // 24 hours
    },
    
    server: {
      port: 5555,
      host: "localhost",
      enableCors: true,
      corsOrigins: ["*"],
      requestTimeout: 30, // 30 seconds
      maxBodySize: 10, // 10MB
    },
    
    auth: {
      required: false,
      defaultToken: "dev-token-12345",
      validationMethod: "static",
    },
    
    index: {
      defaultLevel: "match",
      optimizationThreshold: 10000,
      autoOptimize: true,
      enableCache: true,
      maxCacheSize: 50, // 50MB
    },
    
    logging: {
      level: "info",
      enableFileLogging: false,
      logDirectory: dirs.logs,
      maxLogFileSize: 10, // 10MB
      logRetention: 5,
      enableRequestLogging: true,
    },
    
    cli: {
      historyFile: `${dirs.config}/.good_history`,
      historySize: 1000,
      enableColors: true,
      prompt: "good-base-> ",
      authTimeoutMinutes: 30, // 30 minutes default timeout
    },
  };
}