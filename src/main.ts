#!/usr/bin/env -S deno run --allow-read

import type { AppCommand, Command } from "./commands/_types.ts";
import { AppCommandKeys, AppCommands, appCommands } from "./commands/_constants.ts";
import { CommandHistory, readInputWithHistory } from "./inputHistory.ts";
import { parseArgs } from "./argParser.ts";
import { commandSwitch } from "./commands/_commandSwitch.ts";

const rootCommands: (Command | AppCommand)[] = [
  {
    command: "help",
    args: {},
    description: "Show this help message",
  } as const,
  {
    command: "exit",
    args: {},
    description: "Exit the CLI",
  } as const,
] as const;

const commands = [
  ...rootCommands,
  ...Object.values(appCommands),
] as const;

function showHelp(): void {
  console.log("\nAvailable commands:");
  console.log("==================");

  for (const cmd of commands) {
    // Show command name and description
    console.log(`${cmd.command.padEnd(20)} - ${cmd.description}`);

    // Show arguments on indented lines
    const argNames = Object.keys(cmd.args) as never[];
    if (argNames.length > 0) {
      for (const argName of argNames) {
        console.log(`    --${argName} <${cmd.args[argName]}>`);
      }
    }
  }
  console.log("\n");
}

async function main() {
  console.log("good-base CLI - Type 'exit' to quit - Type 'help' for commands");
  console.log("Use ↑/↓ arrows to navigate command history");

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

    // Switch on the command
    await commandSwitch({
      command: command as AppCommandKeys,
      parsedArgs: parsedArgs as AppCommands<AppCommandKeys>["args"],
    });
  }
}

if (import.meta.main) {
  main();
}
