import { appCommands } from "./_constants.ts";

function logCommandError(commandName: keyof typeof appCommands): void {
  const commandConfig = appCommands[commandName];
  if (!commandConfig) return;

  const argStrings: string[] = [];

  for (const [argName, description] of Object.entries(commandConfig.args)) {
    const alias = argName[0]; // Use first letter as alias
    const argDisplay =
      `--${argName} <${description}> or -${alias} <${description}>`;
    argStrings.push(argDisplay);
  }

  console.error(
    `Error: Missing required arguments for command '${commandName}'.`,
  );
  console.info(`Usage: ${commandName} ${argStrings.join(" ")}`);
}

type AppCommandKeys = keyof typeof appCommands;

type CommandSwitchProps<C extends AppCommandKeys = AppCommandKeys> = {
  command: C;
  parsedArgs: typeof appCommands[C]["args"];
};

export const commandSwitch = async (props: CommandSwitchProps) => {
  if (!props.command) {
    console.log("No command provided. Use 'help' for available commands.");
    return;
  }

  const commandConfig = appCommands[props.command];

  if (!commandConfig) {
    console.log(
      `Unknown command: ${props.command}. Use 'help' for available commands.`,
    );
    return;
  }

  const requiredArgs = Object.keys(commandConfig.args);
  const missingArgs = requiredArgs.filter((arg) => !(arg in props.parsedArgs));

  if (missingArgs.length > 0) {
    logCommandError(props.command);
    return;
  }

  const commandFunction = commandConfig.function;
  if (!commandFunction) {
    console.error(`No function defined for command '${props.command}'.`);
    return;
  }

  try {
    await commandFunction(props.parsedArgs);
  } catch (error) {
    console.error(`Error executing command '${props.command}':`, error);
  }
};
