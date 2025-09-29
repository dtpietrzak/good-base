import {
  Processes,
  processes,
  ProcessKeys,
  rootCommands,
} from "../_constants.ts";
import { processHandler } from "./handleProcessCli.ts";
import { parseArgs } from "./argParser.ts";
import { CommandHistory, readInputWithHistory } from "./commandHistory.ts";

export async function runCli() {
  const history = new CommandHistory();

  while (true) {
    // Print the prompt without a newline
    await Deno.stdout.write(new TextEncoder().encode("good-base-> "));

    // Read user input with history support
    const input = await readInputWithHistory(history);

    // Skip empty input
    if (!input) {
      continue;
    }

    // Add to history
    history.addCommand(input);

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
