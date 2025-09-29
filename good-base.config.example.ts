/**
 * Example TypeScript Configuration for Good-Base
 * 
 * Copy this file to `good-base.config.ts` and customize as needed.
 * The TypeScript format allows for comments, type checking, and dynamic values.
 */

import type { GoodBaseConfig } from "./src/config/types.ts";

// You can use variables and logic in your config
const isDevelopment = Deno.env.get("NODE_ENV") !== "production";
const dataDir = Deno.env.get("DATA_DIR") || "./data";

const config: GoodBaseConfig = {
  database: {
    // Use environment variable or default
    dataDirectory: dataDir,
    
    // Smaller files in development for easier debugging
    maxFileSize: isDevelopment ? 10 : 100,
    
    enableBackups: true,
    backupDirectory: "./backups",
    backupInterval: 24,
  },

  server: {
    // Use port 3000 in development, 8080 in production
    port: isDevelopment ? 3000 : 8080,
    host: "localhost",
    
    enableCors: true,
    // Restrict CORS in production
    corsOrigins: isDevelopment ? ["*"] : ["https://myapp.com"],
    
    requestTimeout: 30,
    maxBodySize: 10,
  },

  auth: {
    // Require auth in production
    required: !isDevelopment,
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
    level: isDevelopment ? "debug" : "info",
    enableFileLogging: !isDevelopment, // Console only in dev
    logDirectory: "./logs",
    maxLogFileSize: 10,
    logRetention: 5,
    enableRequestLogging: true,
  },

  cli: {
    historyFile: "./.good_history",
    historySize: 1000,
    enableColors: true,
    prompt: isDevelopment ? "good-dev-> " : "good-base-> ",
    
    // Longer timeout in development for convenience
    authTimeoutMinutes: isDevelopment ? 120 : 30,
  },
};

export default config;