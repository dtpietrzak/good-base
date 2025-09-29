import type { GoodBaseConfig } from "./src/config/types.ts";

/**
 * Good-Base Configuration
 * 
 * This is the main configuration file for good-base. You can use TypeScript/JavaScript
 * features like comments, conditionals, and computed values.
 */
const config: GoodBaseConfig = {
  // Database Configuration
  database: {
    // Directory where all database files are stored
    dataDirectory: "./data",
    
    // Maximum size for individual database files (in MB)
    // Large files may impact performance but allow more data per file
    maxFileSize: 100,
    
    // Automatic backup settings
    enableBackups: true,
    backupDirectory: "./backups",
    backupInterval: 24, // hours between backups
  },

  // HTTP Server Configuration  
  server: {
    // Server port - use 0 for random available port
    port: 7777,
    
    // Host to bind to - use "0.0.0.0" to accept external connections
    host: "localhost",
    
    // CORS settings for web browser access
    enableCors: true,
    corsOrigins: ["*"], // Use specific origins in production: ["https://myapp.com"]
    
    // Request handling timeouts
    requestTimeout: 30, // seconds
    maxBodySize: 10,    // MB
  },

  // Authentication Configuration
  auth: {
    // Set to true to require auth tokens for all operations
    required: false,
    
    // Default token for development (change for production!)
    defaultToken: "dev-token-12345",
    
    // Token validation method:
    // - "static": Use defaultToken for validation
    // - "jwt": Validate JWT tokens using jwtSecret
    // - "external": Validate via external API endpoint
    validationMethod: "static",
    
    // Uncomment for JWT validation:
    // jwtSecret: "your-secret-key-here",
    
    // Uncomment for external validation:
    // externalEndpoint: "https://auth.yourapp.com/validate",
  },

  // Index Configuration
  index: {
    // Default indexing level for new indexes:
    // - "match": Exact value matching only (fastest writes, exact queries)
    // - "traverse": Sorted keys for range queries (moderate performance)  
    // - "full": Full-text search with tokenization (slower writes, flexible queries)
    defaultLevel: "match",
    
    // Performance tuning
    optimizationThreshold: 10000, // Optimize indexes when they reach this size
    autoOptimize: true,           // Enable automatic optimization
    
    // Memory caching
    enableCache: true,
    maxCacheSize: 50, // MB of indexes to keep in memory
  },

  // Logging Configuration
  logging: {
    // Log level: "debug" | "info" | "warn" | "error"
    level: "info",
    
    // File logging (in addition to console)
    enableFileLogging: false,
    logDirectory: "./logs",
    maxLogFileSize: 10, // MB per log file
    logRetention: 5,    // Number of old log files to keep
    
    // HTTP request/response logging
    enableRequestLogging: true,
  },

  // CLI Configuration
  cli: {
    // Command history
    historyFile: "./.good_history",
    historySize: 1000,
    
    // Display options
    enableColors: true,
    prompt: "good-base-> ",
    
    // Authentication session timeout for CLI
    // Set to 0 for no timeout (session lasts until cleared)
    authTimeoutMinutes: 30,
  },
};

export default config;