/**
 * Example TypeScript Configuration for Good-Base
 *
 * Copy this file to `good-base.config.ts` and customize as needed.
 * The TypeScript format allows for comments, type checking, and dynamic values.
 *
 * Any settings not specified here will use OS-appropriate defaults:
 * - macOS: ~/Library/Application Support/good-base/
 * - Linux: ~/.local/share/good-base/ (or $XDG_DATA_HOME/good-base/)
 * - Windows: %APPDATA%\good-base\
 * - Development: ./tmp/good-base/ (when NODE_ENV !== "production")
 * - Override: Uses DATA_DIR environment variable if set
 */

const config = {
  database: {
    // Use explicit directory (will override OS defaults)
    dataDirectory: "./data",

    // Smaller files in development for easier debugging
    maxFileSize: 100,

    enableBackups: true,
    // Uncomment to override default OS-appropriate backup directory
    // backupDirectory: "./custom-backups",
    backupInterval: 24,
  },

  server: {
    // Use port 3000 in development, 8080 in production
    port: 7777,
    host: "localhost",

    enableCors: true,
    // Restrict CORS in production
    corsOrigins: ["*"],

    requestTimeout: 30,
    maxBodySize: 10,
  },

  auth: {
    // Require auth in production
    required: false,
    defaultToken: "dev-token-12345", // Change this!
    validationMethod: "static",
  },

  index: {
    defaultLevel: "match",
    optimizationThreshold: 10000,
    autoOptimize: true,
    enableCache: true,
    maxCacheSize: 50,
  },

  logging: {
    // More verbose logging in development
    level: "info",
    enableCommandLogging: true, // Console only in dev
    // Uncomment to override default OS-appropriate log directory
    // logDirectory: "./custom-logs",
    maxLogFileSize: 10,
    logRetention: 5,
    enableRequestLogging: true,
  },

  cli: {
    // Explicit history file (will override OS-appropriate default)
    historyFile: "./.good_history",
    historySize: 1000,
    enableColors: true,
    prompt: "good-base-> ",

    // Longer timeout in development for convenience
    authTimeoutMinutes: 30,
  },
};

export default config;
