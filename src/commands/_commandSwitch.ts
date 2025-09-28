import { AppCommandKeys, AppCommands, appCommands } from "./_constants.ts";

function logCommandError(commandName: keyof typeof appCommands): void {
  const commandConfig = appCommands[commandName];
  if (!commandConfig) return;

  const argStrings: string[] = [];

  for (
    const [
      argName,
      descriptionStringOrObj,
    ] of Object.entries(commandConfig.args)
  ) {
    const alias = argName[0]; // Use first letter as alias
    const description = typeof descriptionStringOrObj === "string"
      ? descriptionStringOrObj
      : descriptionStringOrObj.description;
    const argRequired = typeof descriptionStringOrObj === "string"
      ? true
      : descriptionStringOrObj.required ?? true;
    const argDisplay = `\n  --${argName} ${
      argRequired ? "" : "(optional)"
    } <${description}> or -${alias}`;
    argStrings.push(argDisplay);
  }

  console.error(
    `Error: Missing required arguments for command '${commandName}'.`,
  );
  console.info(`Usage Notes: ${commandName} ${argStrings.join(" ")}`);
}

type CommandSwitchProps<C extends AppCommandKeys = AppCommandKeys> = {
  command: C;
  parsedArgs: AppCommands<C>["args"];
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

  const requiredArgs = Object.entries(commandConfig.args)
    .filter(([, desc]) =>
      typeof desc === "string" ? true : desc.required ?? true
    )
    .map(([argName]) => argName);

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
