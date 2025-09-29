import { ConfigLoader } from "./loader.ts";
import type { GoodBaseConfig } from "./types.ts";

// Global configuration instance
let configLoader: ConfigLoader;
let globalConfig: GoodBaseConfig;

/** Initialize the configuration system */
export async function initializeConfig(): Promise<GoodBaseConfig> {
  configLoader = new ConfigLoader();
  globalConfig = await configLoader.load();
  
  // Validate configuration
  const errors = configLoader.validate(globalConfig);
  if (errors.length > 0) {
    console.warn("Configuration validation warnings:");
    for (const error of errors) {
      console.warn(`  - ${error}`);
    }
  }
  
  return globalConfig;
}

/** Get the current configuration (must call initializeConfig first) */
export function getConfig(): GoodBaseConfig {
  if (!globalConfig) {
    throw new Error("Configuration not initialized. Call initializeConfig() first.");
  }
  return globalConfig;
}

/** Reload configuration from all sources */
export async function reloadConfig(): Promise<GoodBaseConfig> {
  if (!configLoader) {
    throw new Error("Configuration not initialized. Call initializeConfig() first.");
  }
  globalConfig = await configLoader.reload();
  return globalConfig;
}

/** Get a specific configuration section */
export function getDatabaseConfig() {
  return getConfig().database;
}

export function getServerConfig() {
  return getConfig().server;
}

export function getAuthConfig() {
  return getConfig().auth;
}

export function getIndexConfig() {
  return getConfig().index;
}

export function getLoggingConfig() {
  return getConfig().logging;
}

export function getCliConfig() {
  return getConfig().cli;
}

// Re-export types for convenience
export type { GoodBaseConfig } from "./types.ts";
export { DEFAULT_CONFIG } from "./defaults.ts";