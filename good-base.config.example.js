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
 * - Override: Uses GOOD_BASE_DATA_DIR environment variable if set
 */

/**
 * @import { GoodBaseConfig } from "./src/config/_types.ts"
 * @type {GoodBaseConfig}
 */
const config = {
  databases: {
    main: {
      // Use explicit directory - override the default location
      databaseDirectory: "./main",

      auth: {
        read: "system", // document | system
        update: "document", // document | system
        delete: "document", // document | system
      },

      maxFileSize: 100,

      enabledBackups: true,
      // Uncomment to override default backup directory
      // backupDirectory: "./custom-backups",
      backupInterval: 24,
    },
    // You can add more databases here:
    // analytics: {
    //   databaseDirectory: "/Volumes/FastSSD/analytics",
    //   backupDirectory: "/Volumes/BackupDrive/analytics-backups",
    //   enabledBackups: true,
    //   backupInterval: 6,
    //   maxFileSize: 500,
    // },
  },

  server: {
    port: 7777,
    host: "localhost",

    // Restrict CORS in production
    enableCors: true,
    corsOrigins: ["*"],

    requestTimeout: 30,
    maxBodySize: 10, // in MB
  },

  auth: {
    // Require auth in production
    required: false,
    defaultToken: "dev-token-12345", // Change this!
    validationMethod: "static",
  },

  logging: {
    // More verbose logging in development
    level: "info",
    enableCommandLogging: true, // Console only in dev
    // Uncomment to override default OS-appropriate log directory
    // logDirectory: "./custom-logs",
    maxLogFileSize: 10,
    maxLogFiles: 5,
    enableRequestLogging: true,
  },

  cli: {
    // Explicit history file (will override OS-appropriate default)
    historyFile: "./.command_history",
    historySize: 100,
    persistentHistory: true, // Set to false to disable saving history to file
    enableColors: true,
    prompt: "good-base-> ",

    // Longer timeout in development for convenience
    authTimeoutMinutes: 30,
  },
};

export default config;
