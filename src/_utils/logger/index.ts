import type { GoodBaseConfig } from "../../config/_types.ts";
import type {
  CommandLog,
  CommandLogOption,
  DatabaseLogOption,
  GeneralLogOption,
  LoggerOptions,
  RequestLog,
  RequestLogOption,
} from "./_types.ts";
import { getConfig, getDirectories } from "../../config/state.ts";

import { green, red, yellow } from "@std/fmt/colors";

import { path } from "../path.ts";
import { logToFile } from "./logToFile.ts";
import { throwError } from "./error.ts";

// Return types for each logger type
type CommandLogger = {
  command: (commandLog: CommandLog) => Promise<void>;
};

type RequestLogger = {
  request: (requestLog: RequestLog) => Promise<void>;
};

type GeneralLogger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  throwError: (error: unknown, ...args: string[]) => void;
};

// Function overloads for type-safe return types
export function logger(props: GeneralLogOption): GeneralLogger;
export function logger(props: CommandLogOption): CommandLogger;
export function logger(props: RequestLogOption): RequestLogger;
export function logger(props: DatabaseLogOption): GeneralLogger;

/**
 * Creates a logger instance with specific functionality based on the provided options.
 *
 * This factory function returns different logger interfaces depending on the type specified:
 * - **command**: Returns a logger for command execution events (call, result, error)
 * - **request**: Returns a logger for HTTP request/response events
 * - **general**: Returns a standard logger with debug, info, warn, error, and throwError methods
 * - **database**: Returns a database-specific logger that writes to database-specific log directories
 *
 * @param props - Configuration object that determines the type and behavior of the logger
 * @param props.type - The type of logger to create ("command" | "request" | "general" | "database")
 * @param props.dbName - Required when type is "database", specifies which database's log directory to use
 *
 * @returns Different logger interfaces based on the type:
 * - For "command": `{ command: (commandLog: CommandLog) => Promise<void> }`
 * - For "request": `{ request: (requestLog: RequestLog) => Promise<void> }`
 * - For "general" or "database": `{ debug, info, warn, error, throwError }` with respective logging methods
 *
 * @example
 * ```typescript
 * // General logger
 * const generalLogger = logger({ type: "general" });
 * generalLogger.info("Application started");
 * generalLogger.error("Something went wrong");
 *
 * // Database-specific logger
 * const dbLogger = logger({ type: "database", dbName: "users" });
 * dbLogger.debug("Query executed successfully");
 *
 * // Command logger
 * const cmdLogger = logger({ type: "command" });
 * await cmdLogger.command({
 *   event: "CALL",
 *   timestamp: new Date().toISOString(),
 *   auth: "user123",
 *   command: "create-user",
 *   args: { name: "John" }
 * });
 *
 * // Request logger
 * const reqLogger = logger({ type: "request" });
 * await reqLogger.request({
 *   event: "REQUEST",
 *   timestamp: new Date().toISOString(),
 *   method: "POST",
 *   url: "/api/users"
 * });
 * ```
 */
export function logger(props: LoggerOptions): CommandLogger | RequestLogger | GeneralLogger {
  const config = getConfig();
  const directories = getDirectories();

  if (props.type === "command") {
    return {
      command: async (commandLog: CommandLog) => {
        if (config.logging.enableCommandLogging) {
          await logToFile(
            path(directories.app.logs, "commands.log"),
            "none",
            JSON.stringify(commandLog),
          );
        }
      },
    };
  } else if (props.type === "request") {
    return {
      request: async (requestLog: RequestLog) => {
        if (config.logging.enableRequestLogging) {
          await logToFile(
            path(directories.app.logs, "requests.log"),
            "none",
            JSON.stringify(requestLog),
          );
        }
      },
    };
  } else {
    return {
      debug: (...args: unknown[]) => {
        const config = getConfig();
        if (config.logging.level === "debug") {
          log(props, config.logging.level, args.join(" "));
        }
      },
      info: (...args: unknown[]) => {
        const config = getConfig();
        if (
          config.logging.level === "debug" ||
          config.logging.level === "info"
        ) {
          log(props, config.logging.level, args.join(" "));
        }
      },
      warn: (...args: unknown[]) => {
        const config = getConfig();
        if (
          config.logging.level === "debug" ||
          config.logging.level === "info" ||
          config.logging.level === "warn"
        ) {
          log(props, config.logging.level, args.join(" "));
        }
      },
      error: (...args: unknown[]) => {
        const config = getConfig();
        log(props, config.logging.level, args.join(" "));
      },
      throwError: (error: unknown, ...args: string[]): void => {
        log(props, "error", args.join(" "), "bypass-console");
        throwError(error, args.join(" "));
      },
    };
  }
};

const log = (
  logOption: GeneralLogOption | DatabaseLogOption,
  level: GoodBaseConfig["logging"]["level"],
  message: string,
  print: "bypass-console" | "console" = "console",
) => {
  const directories = getDirectories();

  const logDir = logOption.type === "database"
    ? directories.databases[logOption.dbName]?.logs
    : directories.app.logs;

  switch (level) {
    case "debug":
      if (print === "console") console.debug("[DEBUG]", green(message));
      logToFile(logDir, level, message);
      break;
    case "info":
      if (print === "console") console.info("[INFO] ", message);
      logToFile(logDir, level, message);
      break;
    case "warn":
      if (print === "console") console.warn("[WARN] ", yellow(message));
      logToFile(logDir, level, message);
      break;
    case "error":
      if (print === "console") console.error("[ERROR]", red(message));
      logToFile(logDir, level, message);
      break;
    default:
      if (print === "console") console.log(message);
      logToFile(logDir, level, message);
      break;
  }
};
