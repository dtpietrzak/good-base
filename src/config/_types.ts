export type DatabaseConfig = {
  [name: string]: {
    /** Database directory path (overrides default location) */
    databaseDirectory?: string;
    /** Enable automatic backups */
    enabledBackups: boolean;
    /** Backup directory path */
    backupDirectory?: string;
    /** How often to create backups (in hours) */
    backupInterval?: number;
    /** Maximum file size for database files (in MB) */
    maxFileSize: number;
  };
};

export type ServerConfig = {
  /** Server host/interface to bind to */
  host: string;
  /** HTTP server port */
  port: number;
  /** Enable CORS */
  enableCors: boolean;
  /** Allowed CORS origins */
  corsOrigins: string[];
  /** Request timeout in seconds */
  requestTimeout: number;
  /** Maximum request body size (in MB) */
  maxBodySize: number;
};

export type AuthConfig = {
  /** Whether authentication is required */
  required: boolean;
  /** Default authentication token (for development) */
  defaultToken?: string;
  /** Token validation method */
  validationMethod: "static" | "jwt" | "external";
  /** JWT secret (if using JWT validation) */
  jwtSecret?: string;
  /** External validation endpoint (if using external validation) */
  externalEndpoint?: string;
};

export type LoggingConfig = {
  /** Logging level */
  level: "debug" | "info" | "warn" | "error" | "none";
  /** Enable file logging */
  enableCommandLogging: boolean;
  /** Enable request/response logging */
  enableRequestLogging: boolean;
  /** Maximum log file size (in MB) */
  maxLogFileSize: number;
  /** Number of log files to keep */
  maxLogFiles: number;
  /** Log file directory */
  logDirectory?: string;
};

export type CliConfig = {
  /** Command history file path */
  historyFile?: string;
  /** Maximum number of commands to keep in history */
  historySize: number;
  /** Enable persistent command history (save to file) */
  persistentHistory: boolean;
  /** Enable colored output */
  enableColors: boolean;
  /** CLI prompt text */
  prompt: string;
  /** Auth session timeout in minutes (0 = no timeout) */
  authTimeoutMinutes: number;
};

export type GoodBaseConfig = {
  databases: DatabaseConfig;
  server: ServerConfig;
  auth: AuthConfig;
  logging: LoggingConfig;
  cli: CliConfig;
};

export type AppDirs = {
  base: string;
  config: string;
  logs: string;
  databases: string;
};

export type DatabaseDirs = {
  base: string;
  data: string;
  cache: string;
  logs: string;
  backups: string;
};

export type Directories = {
  app: AppDirs;
  databases: { [name: string]: DatabaseDirs };
};

export type Setup = {
  config: GoodBaseConfig;
  directories: Directories;
};

// for indexing later
export type IndexConfig = {
  /** Default index level for new indexes */
  defaultLevel: "match" | "traverse" | "full";
  /** Maximum number of items in an index before optimization kicks in */
  optimizationThreshold: number;
  /** Enable automatic index optimization */
  autoOptimize: boolean;
  /** Cache frequently accessed indexes in memory */
  enableCache: boolean;
  /** Maximum cache size (in MB) */
  maxCacheSize: number;
};
