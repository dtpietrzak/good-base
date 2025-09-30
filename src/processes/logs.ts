/**
 * Command log viewer process
 */

import { commandLogger } from "../cli/commandLogger.ts";
import type { ProcessResponse } from "../_types.ts";

interface LogsArgs {
  limit?: string;
  verbose?: string;
}

export default async function logs(args: LogsArgs): Promise<ProcessResponse> {
  try {
    const limit = args.limit ? parseInt(args.limit, 10) : 50;
    const verbose = args.verbose === "true";

    console.log(`\nShowing last ${limit} command log entries:\n`);

    const entries = await commandLogger.readCommandLogs(limit);

    if (entries.length === 0) {
      console.log("No command log entries found.");
      return { success: true, data: [] };
    }

    for (const entry of entries) {
      const timestamp = new Date(entry.timestamp).toLocaleString();
      const authDisplay = entry.auth ? entry.auth.substring(0, 8) + "..." : "none";
      const status = entry.success ? "✓" : "✗";
      
      if (verbose) {
        console.log(`[${timestamp}] ${status} ${entry.command}`);
        console.log(`  Auth: ${authDisplay}`);
        if (Object.keys(entry.args).length > 0) {
          console.log(`  Args: ${JSON.stringify(entry.args)}`);
        }
        if (entry.error) {
          console.log(`  Error: ${entry.error}`);
        }
        console.log("");
      } else {
        const argsStr = Object.keys(entry.args).length > 0 
          ? ` (${Object.keys(entry.args).join(", ")})`
          : "";
        console.log(`[${timestamp}] ${status} ${entry.command}${argsStr} | auth: ${authDisplay}`);
      }
    }

    if (!verbose) {
      console.log(`\nUse --verbose for detailed view`);
    }

    return { success: true, data: entries };
  } catch (error) {
    console.error("Error reading command logs:", error);
    return { success: false, data: null };
  }
}