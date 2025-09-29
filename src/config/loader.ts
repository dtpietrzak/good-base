import type { GoodBaseConfig, ConfigSource, PartialGoodBaseConfig } from "./types.ts";
import { getDefaultConfig } from "./defaults.ts";
import { FileConfigSource, EnvironmentConfigSource } from "./sources.ts";
import { ensureAppDirectories } from "./directories.ts";

export class ConfigLoader {
  private sources: ConfigSource[] = [];
  private loadedConfig?: GoodBaseConfig;

  constructor() {
    // Add default sources
    this.addSource(new FileConfigSource("./good-base.config.ts"));
    this.addSource(new EnvironmentConfigSource());
  }

  addSource(source: ConfigSource): void {
    this.sources.push(source);
    // Sort by priority (highest first)
    this.sources.sort((a, b) => b.priority - a.priority);
  }

  async load(): Promise<GoodBaseConfig> {
    if (this.loadedConfig) {
      return this.loadedConfig;
    }

    // Start with default configuration (with OS-appropriate directories)
    let config: GoodBaseConfig = structuredClone(await getDefaultConfig());

    // Load from all sources in order of priority
    for (const source of this.sources) {
      try {
        const sourceConfig = await source.load();
        config = this.mergeConfigs(config, sourceConfig);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Failed to load config from source: ${errorMessage}`);
      }
    }

    // Ensure all necessary directories exist
    await this.ensureDirectoriesExist(config);

    this.loadedConfig = config;
    return config;
  }

  private async ensureDirectoriesExist(config: GoodBaseConfig): Promise<void> {
    const directories = [
      config.database.dataDirectory,
      config.database.backupDirectory,
      config.logging.logDirectory,
    ].filter(Boolean) as string[];

    // Also ensure the config directory exists for history file
    if (config.cli.historyFile) {
      const historyDir = config.cli.historyFile.substring(0, config.cli.historyFile.lastIndexOf('/'));
      if (historyDir) {
        directories.push(historyDir);
      }
    }

    // Create all directories
    for (const dir of directories) {
      try {
        await Deno.mkdir(dir, { recursive: true });
      } catch (error) {
        if (!(error instanceof Deno.errors.AlreadyExists)) {
          console.warn(`Failed to create directory ${dir}:`, error);
        }
      }
    }

    // Also ensure the full app directory structure exists
    try {
      await ensureAppDirectories("good-base");
    } catch (error) {
      console.warn("Failed to ensure app directories:", error);
    }
  }

  private mergeConfigs(base: GoodBaseConfig, override: PartialGoodBaseConfig): GoodBaseConfig {
    const result = structuredClone(base);

    if (override.database) {
      result.database = { ...result.database, ...override.database };
    }
    if (override.server) {
      result.server = { ...result.server, ...override.server };
    }
    if (override.auth) {
      result.auth = { ...result.auth, ...override.auth };
    }
    if (override.index) {
      result.index = { ...result.index, ...override.index };
    }
    if (override.logging) {
      result.logging = { ...result.logging, ...override.logging };
    }
    if (override.cli) {
      result.cli = { ...result.cli, ...override.cli };
    }

    return result;
  }

  /** Reload configuration from all sources */
  async reload(): Promise<GoodBaseConfig> {
    this.loadedConfig = undefined;
    return await this.load();
  }

  /** Get current configuration without reloading */
  get current(): GoodBaseConfig | undefined {
    return this.loadedConfig;
  }

  /** Validate configuration for common issues */
  validate(config: GoodBaseConfig): string[] {
    const errors: string[] = [];

    // Database validation
    if (!config.database.dataDirectory) {
      errors.push("Database data directory is required");
    }

    if (config.database.maxFileSize <= 0) {
      errors.push("Database max file size must be greater than 0");
    }

    // Server validation
    if (config.server.port <= 0 || config.server.port > 65535) {
      errors.push("Server port must be between 1 and 65535");
    }
    if (!config.server.host) {
      errors.push("Server host is required");
    }
    if (config.server.requestTimeout <= 0) {
      errors.push("Server request timeout must be greater than 0");
    }

    // Auth validation
    if (config.auth.required && !config.auth.defaultToken && config.auth.validationMethod === "static") {
      errors.push("Authentication token is required when auth is enabled with static validation");
    }
    if (config.auth.validationMethod === "jwt" && !config.auth.jwtSecret) {
      errors.push("JWT secret is required when using JWT validation");
    }

    // Index validation
    if (config.index.optimizationThreshold <= 0) {
      errors.push("Index optimization threshold must be greater than 0");
    }

    // Logging validation
    if (config.logging.enableFileLogging && !config.logging.logDirectory) {
      errors.push("Log directory is required when file logging is enabled");
    }

    return errors;
  }
}