import { z } from "zod";

const DatabasesSchema = z.record(
  z.string().min(1),
  z.object({
    /** Database directory path (overrides default location) */
    databaseDirectory: z.string().min(1).optional(),
    /** Enable automatic backups */
    enabledBackups: z.boolean(),
    /** Backup directory path */
    backupDirectory: z.string().min(1).optional(),
    /** How often to create backups (in hours) */
    backupInterval: z.number().min(0).optional(),
    /** Maximum file size for database files (in MB) */
    maxFileSize: z.number().min(1),
  }),
);

const ServerSchema = z.object({
  /** Server host/interface to bind to */
  host: z.string().min(1),
  /** HTTP server port */
  port: z.number().min(1).max(65535),
  /** Enable CORS */
  enableCors: z.boolean(),
  /** Allowed CORS origins */
  corsOrigins: z.array(z.string().min(1)),
  /** Request timeout in seconds */
  requestTimeout: z.number().min(1),
  /** Maximum request body size (in MB) */
  maxBodySize: z.number().min(0),
});

const AuthSchema = z.object({
  /** Whether authentication is required */
  required: z.boolean(),
  /** Default authentication token (for development) */
  defaultToken: z.string().min(1).optional(),
  /** Token validation method */
  validationMethod: z.enum(["static", "jwt", "external"]),
  /** JWT secret (if using JWT validation) */
  jwtSecret: z.string().min(1).optional(),
  /** External validation endpoint (if using external validation) */
  externalEndpoint: z.string().min(1).optional(),
});

const LoggingSchema = z.object({
  /** Logging level */
  level: z.enum(["debug", "info", "warn", "error", "none"]),
  /** Enable file logging */
  enableCommandLogging: z.boolean(),
  /** Enable request/response logging */
  enableRequestLogging: z.boolean(),
  /** Maximum log file size (in MB) */
  maxLogFileSize: z.number().min(1),
  /** Number of log files to keep */
  maxLogFiles: z.number().min(1),
  /** Log file directory */
  logDirectory: z.string().min(1).optional(),
});

const CliSchema = z.object({
  /** Command history file path */
  historyFile: z.string().min(1).optional(),
  /** Maximum number of commands to keep in history */
  historySize: z.number().min(1),
  /** Enable persistent command history (save to file) */
  persistentHistory: z.boolean(),
  /** Enable colored output */
  enableColors: z.boolean().optional(),
  /** CLI prompt text */
  prompt: z.string().min(1),
  /** Auth session timeout in minutes (0 = no timeout) */
  authTimeoutMinutes: z.number().min(0),
});

export const GoodBaseConfigSchema = z.object({
  databases: DatabasesSchema,
  server: ServerSchema,
  auth: AuthSchema,
  logging: LoggingSchema,
  cli: CliSchema,
});
