/**
 * Command logging utility for tracking CLI command execution
 */

import { getAppDirs } from "../config/directories.ts";
import { getConfig } from "../config/index.ts";

export interface CommandLogEntry {
  timestamp: string;
  command: string;
  auth: string | null;
  args: Record<string, unknown>;
  success: boolean;
  error?: string;
}

export class CommandLogger {
  private logDirectory: string | null = null;
  private enabled: boolean | null = null;

  constructor() {
    // Config will be loaded lazily when needed
  }

  /**
   * Get the current configuration, loading it lazily
   */
  private getConfig() {
    if (this.logDirectory === null || this.enabled === null) {
      const config = getConfig();
      this.logDirectory = config.logging.logDirectory || getAppDirs().logs;
      this.enabled = config.logging.enableCommandLogging;
    }
    return { logDirectory: this.logDirectory!, enabled: this.enabled! };
  }

  /**
   * Log a command execution
   */
  async logCommand(entry: Omit<CommandLogEntry, "timestamp">): Promise<void> {
    const { enabled } = this.getConfig();
    
    if (!enabled) {
      return;
    }

    const logEntry: CommandLogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    try {
      await this.ensureLogDirectory();
      await this.writeLogEntry(logEntry);
    } catch (error) {
      // Don't throw errors for logging failures, just warn
      console.warn("Failed to write command log:", error);
    }
  }

  /**
   * Ensure the log directory exists
   */
  private async ensureLogDirectory(): Promise<void> {
    const { logDirectory } = this.getConfig();
    
    try {
      await Deno.mkdir(logDirectory, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
  }

  /**
   * Write a log entry to the command log file
   */
  private async writeLogEntry(entry: CommandLogEntry): Promise<void> {
    const { logDirectory } = this.getConfig();
    const logFile = `${logDirectory}/commands.log`;
    const logLine = JSON.stringify(entry) + "\n";

    try {
      await Deno.writeTextFile(logFile, logLine, { append: true });
    } catch (error) {
      // If file doesn't exist, create it
      if (error instanceof Deno.errors.NotFound) {
        await Deno.writeTextFile(logFile, logLine);
      } else {
        throw error;
      }
    }

    // Check if we need to rotate the log file
    await this.rotateLogIfNeeded(logFile);
  }

  /**
   * Rotate log file if it exceeds the maximum size
   */
  private async rotateLogIfNeeded(logFile: string): Promise<void> {
    try {
      const config = getConfig();
      const maxSizeBytes = config.logging.maxLogFileSize * 1024 * 1024; // Convert MB to bytes
      
      const stat = await Deno.stat(logFile);
      if (stat.size > maxSizeBytes) {
        await this.rotateLogFile(logFile, config.logging.logRetention);
      }
    } catch (error) {
      // If we can't check the file size, just continue
      console.warn("Failed to check log file size:", error);
    }
  }

  /**
   * Rotate the log file by moving it to a numbered backup
   */
  private async rotateLogFile(logFile: string, retention: number): Promise<void> {
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
      console.warn("Failed to rotate log file:", error);
    }
  }

  /**
   * Read command log entries (for debugging or viewing)
   */
  async readCommandLogs(limit?: number): Promise<CommandLogEntry[]> {
    const { logDirectory } = this.getConfig();
    const logFile = `${logDirectory}/commands.log`;
    
    try {
      const content = await Deno.readTextFile(logFile);
      const lines = content.trim().split("\n").filter(line => line.length > 0);
      
      const entries: CommandLogEntry[] = [];
      for (const line of lines) {
        try {
          entries.push(JSON.parse(line));
        } catch {
          // Skip invalid JSON lines
        }
      }

      if (limit && limit > 0) {
        return entries.slice(-limit); // Return last N entries
      }

      return entries;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return []; // Log file doesn't exist yet
      }
      throw error;
    }
  }
}

// Global instance for CLI
export const commandLogger = new CommandLogger();