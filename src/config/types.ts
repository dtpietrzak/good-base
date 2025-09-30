export interface DatabaseConfig {
  /** Main directory where database files are stored */
  dataDirectory?: string;
  /** Maximum file size for database files (in MB) */
  maxFileSize: number;
  /** Enable automatic backups */
  enableBackups: boolean;
  /** Backup directory path */
  backupDirectory?: string;
  /** How often to create backups (in hours) */
  backupInterval?: number;
}

export interface ServerConfig {
  /** HTTP server port */
  port: number;
  /** Server host/interface to bind to */
  host: string;
  /** Enable CORS */
  enableCors: boolean;
  /** Allowed CORS origins */
  corsOrigins: string[];
  /** Request timeout in seconds */
  requestTimeout: number;
  /** Maximum request body size (in MB) */
  maxBodySize: number;
}

export interface AuthConfig {
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
}

export interface IndexConfig {
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
}

export interface LoggingConfig {
  /** Logging level */
  level: "debug" | "info" | "warn" | "error";
  /** Enable file logging */
  enableCommandLogging: boolean;
  /** Log file directory */
  logDirectory?: string;
  /** Maximum log file size (in MB) */
  maxLogFileSize: number;
  /** Number of log files to keep */
  logRetention: number;
  /** Enable request/response logging */
  enableRequestLogging: boolean;
}

export interface CliConfig {
  /** Command history file path */
  historyFile?: string;
  /** Maximum number of commands to keep in history */
  historySize: number;
  /** Enable colored output */
  enableColors: boolean;
  /** CLI prompt text */
  prompt: string;
  /** Auth session timeout in minutes (0 = no timeout) */
  authTimeoutMinutes: number;
}

export interface GoodBaseConfig {
  database: DatabaseConfig;
  server: ServerConfig;
  auth: AuthConfig;
  index: IndexConfig;
  logging: LoggingConfig;
  cli: CliConfig;
}

export interface PartialGoodBaseConfig {
  database?: Partial<DatabaseConfig>;
  server?: Partial<ServerConfig>;
  auth?: Partial<AuthConfig>;
  index?: Partial<IndexConfig>;
  logging?: Partial<LoggingConfig>;
  cli?: Partial<CliConfig>;
}

export interface ConfigSource {
  /** Load configuration from this source */
  load(): Promise<PartialGoodBaseConfig> | PartialGoodBaseConfig;
  /** Priority of this source (higher number = higher priority) */
  priority: number;
  optional?: boolean;
}