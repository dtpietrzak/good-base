import {
  Processes,
  processes,
  ProcessKeys,
  rootCommands,
} from "../_constants.ts";
import { processHandler } from "./handleProcessCli.ts";
import { parseArgs } from "./argParser.ts";
import { CommandHistory, readInputWithHistory } from "./commandHistory.ts";
import { cliAuthManager } from "./authManager.ts";
import { GoodBaseConfig } from "../config/_types.ts";
import { logger } from "../_utils/logger/index.ts";

/**
 * Log special commands like help, exit, etc.
 */
async function logSpecialCommand(
  command: string,
  args: Record<string, unknown>,
): Promise<void> {
  const authId = cliAuthManager.getCurrentAuth();
  const log = logger({ type: "command" });
  await log.command({
    timestamp: new Date().toISOString(),
    command,
    args,
    auth: authId ?? null,
    event: "CALL",
  });
}

export async function runCli(config: GoodBaseConfig) {
  const history = new CommandHistory({
    historyFile: config.cli.historyFile,
    historySize: config.cli.historySize,
    persistentHistory: config.cli.persistentHistory,
  });

  // Initialize history from file
  await history.initialize();

  while (true) {
    // Print the prompt without a newline
    await Deno.stdout.write(new TextEncoder().encode(config.cli.prompt));

    // Read user input with history support
    const input = await readInputWithHistory(history);

    // Skip empty input
    if (!input) {
      continue;
    }

    // Add to history
    await history.addCommand(input);

    // Check if user wants to exit
    if (input.toLowerCase() === "exit") {
      await logSpecialCommand("exit", {});
      console.log("Goodbye!");
      break;
    }

    // Check if user wants help
    if (input.toLowerCase() === "help") {
      await logSpecialCommand("help", {});
      showHelp();
      continue;
    }

    if (input.toLowerCase() === "index-help") {
      await logSpecialCommand("index-help", {});
      showIndexHelp();
      continue;
    }

    // Parse command and arguments
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const commandArgs = parts.slice(1);
    const parsedArgs = parseArgs(commandArgs);
    // if an arg comes in as a single letter, map it to its full arg
    for (const [key, value] of Object.entries(parsedArgs)) {
      const expectedArgsForCommand = Object.keys(
        (processes[command] as Processes<ProcessKeys>)?.args ||
          (rootCommands.find((cmd) => cmd.command === command)?.args || {}),
      );

      if (key.length === 1) {
        const fullArg = expectedArgsForCommand.find((arg) =>
          arg.startsWith(key)
        );
        if (fullArg) {
          parsedArgs[fullArg] = value;
          delete parsedArgs[key];
        }
      }
    }

    // Switch on the command
    await processHandler({
      process: command as ProcessKeys,
      parsedArgs: parsedArgs as Processes<ProcessKeys>["args"],
    });
  }
}

function showHelp(): void {
  console.log("\nUse ↑/↓ arrows to navigate command history");
  console.log("\nAvailable commands:");
  console.log("==================");

  const commands = [
    ...rootCommands,
    ...Object.values(processes),
  ];

  for (const cmd of commands) {
    // Show command name and description
    console.log(`${cmd.command.padEnd(20)} - ${cmd.description}`);

    // Show arguments on indented lines
    const argNames = Object.keys(cmd.args) as never[];
    if (argNames.length > 0) {
      for (const argName of argNames) {
        console.log(
          `    -${argName[0]} or --${argName} <${cmd.args[argName]}>`,
        );
      }
    }
  }
  console.log("\n");
}

function showIndexHelp(): void {
  console.log("\nIndex Levels:");
  console.log("=============\n");
  console.log(
    "1. match: Only index exact values. Use this for fields where you need to retrieve items by exact key. The downside is that you cannot perform range queries or text searches on this index.\nexample queries: get item by exact key, get multiple items by exact keys (list of keys)\napproximate create efficiency: O(1) per insert, approximate storage efficiency: O(n)\n",
  );

  console.log(
    "2. traverse: Index keys in sorted order. Use this for fields where you need range queries, sorted retrievals, or prefix/suffix lookups. The keys are stored in a structure that allows efficient ordered traversal. The downside is slightly higher storage cost and slower writes compared to 'match'.\nexample queries: get items between two values, get top N items, get items starting with 'prefix', get items ending with 'suffix'\napproximate create efficiency: O(log n) per insert, approximate storage efficiency: O(n)\n",
  );

  console.log(
    "3. full: Index tokenized values for full-text search. Use this for fields where you need substring, word-based, or fuzzy search (ngrams, typos). The downside is higher storage and write cost compared to 'match' and 'traverse'.\nexample queries: search for items containing 'word', search for items containing 'multiple words', search with typos 'wrod'\napproximate create efficiency: O(n log n) per field value, approximate storage efficiency: O(n log n)\n",
  );

  console.log(
    "\nChoose the appropriate index level based on your query needs and performance considerations.\n",
  );
}
