import { GoodBaseConfig } from "../../config/_types.ts";
import { getConfig } from "../../config/state.ts";
import { path } from "../path.ts";
import { throwError } from "./error.ts";

export const logToFile = async (
  logDirectory: string,
  level: GoodBaseConfig["logging"]["level"],
  message: string,
) => {
  const config = getConfig();
  if (config.logging.level === "none") return;

  await ensureLogDirectory(logDirectory);

  const logFilePath = path(logDirectory, `${level}.log`);
  const logMessage = `[${
    new Date().toISOString()
  }] [${level.toUpperCase()}] ${message}\n`;

  try {
    await Deno.writeTextFile(logFilePath, logMessage, { append: true });
  } catch (error) {
    throwError(error, `Failed to write log to file`);
  }

  await rotateLogIfNeeded(logFilePath);
};

const ensureLogDirectory = async (logDirectory: string): Promise<void> => {
  try {
    await Deno.mkdir(logDirectory, { recursive: true });
  } catch (error) {
    throwError(error, `Failed to ensure log directory`);
  }
};

const rotateLogIfNeeded = async (logFilePath: string): Promise<void> => {
  try {
    const config = getConfig();
    const maxSizeBytes = config.logging.maxLogFileSize * 1024 * 1024; // Convert MB to bytes

    const stat = await Deno.stat(logFilePath);
    if (stat.size > maxSizeBytes) {
      await rotateLogFile(logFilePath, config.logging.maxLogFiles);
    }
  } catch (error) {
    // If we can't check the file size, just continue
    console.warn(error, "Failed to check log file size");
  }
};

const rotateLogFile = async (
  logFile: string,
  retention: number,
): Promise<void> => {
  try {
    // Move existing numbered logs
    for (let i = retention - 1; i >= 1; i--) {
      const oldFile = `${logFile}.${i}`;
      const newFile = `${logFile}.${i + 1}`;

      try {
        await Deno.stat(oldFile);
        await Deno.rename(oldFile, newFile);
      } catch {
        // File doesn't exist, skip
      }
    }

    // Remove the oldest log if it would exceed retention
    const oldestFile = `${logFile}.${retention}`;
    try {
      await Deno.remove(oldestFile);
    } catch {
      // File doesn't exist, that's fine
    }

    // Move current log to .1
    await Deno.rename(logFile, `${logFile}.1`);
  } catch (error) {
    throwError(error, "Failed to rotate log file");
  }
};
