import type { ConfigSource, PartialGoodBaseConfig, DatabaseConfig, ServerConfig, AuthConfig, LoggingConfig, CliConfig, GoodBaseConfig } from "./types.ts";

export class FileConfigSource implements ConfigSource {
  priority = 2;
  
  constructor(private filePath: string) {}
  
  async load(): Promise<PartialGoodBaseConfig> {
    try {
      // Load TypeScript/JavaScript module config
      const module = await import(`file://${Deno.cwd()}/${this.filePath}`);
      return module.default as GoodBaseConfig;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return {};
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load config from ${this.filePath}: ${errorMessage}`);
    }
  }
}

export class EnvironmentConfigSource implements ConfigSource {
  priority = 3;
  
  load(): PartialGoodBaseConfig {
    const config: PartialGoodBaseConfig = {};
    
    // Database config
    const dataDir = Deno.env.get("GOOD_BASE_DATA_DIR");
    const backupDir = Deno.env.get("GOOD_BASE_BACKUP_DIR");
    const enableBackups = Deno.env.get("GOOD_BASE_ENABLE_BACKUPS");
    
    if (dataDir || backupDir || enableBackups) {
      const dbConfig: Partial<DatabaseConfig> = {};
      if (dataDir) dbConfig.dataDirectory = dataDir;
      if (backupDir) dbConfig.backupDirectory = backupDir;
      if (enableBackups) dbConfig.enableBackups = enableBackups === 'true';
      config.database = dbConfig;
    }
    
    // Server config
    const port = Deno.env.get("GOOD_BASE_PORT");
    const host = Deno.env.get("GOOD_BASE_HOST");
    const corsOrigins = Deno.env.get("GOOD_BASE_CORS_ORIGINS");
    
    if (port || host || corsOrigins) {
      const serverConfig: Partial<ServerConfig> = {};
      if (port) serverConfig.port = parseInt(port, 10);
      if (host) serverConfig.host = host;
      if (corsOrigins) serverConfig.corsOrigins = corsOrigins.split(',').map(s => s.trim());
      config.server = serverConfig;
    }
    
    // Auth config
    const authRequired = Deno.env.get("GOOD_BASE_AUTH_REQUIRED");
    const authToken = Deno.env.get("GOOD_BASE_AUTH_TOKEN");
    const jwtSecret = Deno.env.get("GOOD_BASE_JWT_SECRET");
    
    if (authRequired || authToken || jwtSecret) {
      const authConfig: Partial<AuthConfig> = {};
      if (authRequired) authConfig.required = authRequired === 'true';
      if (authToken) authConfig.defaultToken = authToken;
      if (jwtSecret) authConfig.jwtSecret = jwtSecret;
      config.auth = authConfig;
    }
    
    // Logging config
    const logLevel = Deno.env.get("GOOD_BASE_LOG_LEVEL");
    const logDir = Deno.env.get("GOOD_BASE_LOG_DIR");
    const enableFileLogging = Deno.env.get("GOOD_BASE_ENABLE_FILE_LOGGING");
    
    if (logLevel || logDir || enableFileLogging) {
      const loggingConfig: Partial<LoggingConfig> = {};
      if (logLevel && ["debug", "info", "warn", "error"].includes(logLevel)) {
        loggingConfig.level = logLevel as "debug" | "info" | "warn" | "error";
      }
      if (logDir) loggingConfig.logDirectory = logDir;
      if (enableFileLogging) loggingConfig.enableFileLogging = enableFileLogging === 'true';
      config.logging = loggingConfig;
    }

    // CLI config
    const cliAuthTimeout = Deno.env.get("GOOD_BASE_CLI_AUTH_TIMEOUT");
    const cliPrompt = Deno.env.get("GOOD_BASE_CLI_PROMPT");
    
    if (cliAuthTimeout || cliPrompt) {
      const cliConfig: Partial<CliConfig> = {};
      if (cliAuthTimeout) {
        const timeout = parseInt(cliAuthTimeout, 10);
        if (!isNaN(timeout)) cliConfig.authTimeoutMinutes = timeout;
      }
      if (cliPrompt) cliConfig.prompt = cliPrompt;
      config.cli = cliConfig;
    }
    
    return config;
  }
}