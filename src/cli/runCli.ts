import { processes, ProcessKeys, rootCommands } from "../_constants.ts";
import { processHandler } from "./handleProcessCli.ts";
import { parseArgs } from "./argParser.ts";
import { CommandHistory, readInputWithHistory } from "./commandHistory.ts";
import { cliAuthManager } from "./authManager.ts";
import { Setup } from "../config/_types.ts";
import { logger } from "../_utils/logger/index.ts";
import { path } from "../_utils/path.ts";

export async function runCli(setup: Setup) {
  const historyFilePath = path(
    setup.directories.app.logs,
    setup.config.cli.historyFile ?? "./.command_history",
  );
  const history = new CommandHistory({
    historyFilePath: historyFilePath,
    historySize: setup.config.cli.historySize,
    persistentHistory: setup.config.cli.persistentHistory,
  });

  // Initialize history from file
  await history.initialize();

  while (true) {
    // Print the prompt without a newline
    await Deno.stdout.write(new TextEncoder().encode(setup.config.cli.prompt));

    // Read user input with history support
    const input = await readInputWithHistory(history);

    // Skip empty input
    if (!input) {
      continue;
    }

    // Add to history
    await history.addCommand(input);

    // Parse command and arguments
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const commandArgs = parts.slice(1);
    const parsedArgs = parseArgs(commandArgs);
    // get authId
    const authId = cliAuthManager.getCurrentAuth();

    await logger({ type: "command" }).command({
      timestamp: new Date().toISOString(),
      command: command,
      args: parsedArgs,
      auth: parsedArgs["auth"] ? parsedArgs["auth"] as string : authId ?? null,
      event: "CALL",
    });

    // Check if user wants to exit
    if (input.toLowerCase() === "exit") {
      console.log("Goodbye!");
      break;
    }

    // Check if user wants help
    if (input.toLowerCase() === "help") {
      showHelp();
      continue;
    }

    if (input.toLowerCase() === "index-help") {
      showIndexHelp();
      continue;
    }

    // if an arg comes in as a single letter, map it to its full arg
    for (const [key, value] of Object.entries(parsedArgs)) {
      const processConfig = processes[command as ProcessKeys];
      const expectedArgsForCommand = processConfig
        ? Object.keys(processConfig.args)
        : Object.keys(
          rootCommands.find((cmd) => cmd.command === command)?.args || {},
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

    const authToken = cliAuthManager.getCurrentAuth();

    // Switch on the command
    await processHandler({
      processKey: command as ProcessKeys,
      parsedArgs: parsedArgs,
      authToken: authToken,
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
    const argNames = Object.keys(cmd.args);
    if (argNames.length > 0) {
      for (const argName of argNames) {
        console.log(
          `    -${argName[0]} or --${argName} <${
            (cmd.args as Record<string, { description: string }>)[argName]
              .description
          }>`,
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
