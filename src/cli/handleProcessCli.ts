import { type Processes, processes, type ProcessKeys } from "../_constants.ts";
import { cliAuthManager } from "./authManager.ts";

function logProcessError(processName: keyof typeof processes): void {
  const processConfig = processes[processName];
  if (!processConfig) return;

  const argStrings: string[] = [];

  for (
    const [
      argName,
      description,
    ] of Object.entries(processConfig.args)
  ) {
    const alias = argName[0]; // Use first letter as alias
    const argRequired = !description.startsWith("(Optional)");
    const argDisplay = `\n  --${argName} ${
      argRequired ? "" : "(optional)"
    } <${description}> or -${alias}`;
    argStrings.push(argDisplay);
  }

  console.error(
    `Error: Missing required arguments for process '${processName}'.`,
  );
  console.info(`Usage Notes: ${processName} ${argStrings.join(" ")}`);
}

type ProcessSwitchProps<C extends ProcessKeys = ProcessKeys> = {
  process: C;
  parsedArgs: Processes<C>["args"];
};

export const processHandler = async (props: ProcessSwitchProps) => {
  if (!props.process) {
    console.log("No process provided. Use 'help' for available processs.");
    return;
  }

  const processConfig = processes[props.process];

  if (!processConfig) {
    console.log(
      `Unknown process: ${props.process}. Use 'help' for available processs.`,
    );
    return;
  }

  const requiredArgs = Object.entries(processConfig.args)
    .filter(([, desc]) => !desc.startsWith("(Optional)"))
    .map(([argName]) => argName);

  const missingArgs = requiredArgs.filter((arg) => !(arg in props.parsedArgs));

  if (missingArgs.length > 0) {
    logProcessError(props.process);
    return;
  }

  const processFunction = processConfig.function;
  if (!processFunction) {
    console.error(`No function defined for process '${props.process}'.`);
    return;
  }

  try {
    // Auto-inject auth token for commands that need it (except auth command itself)
    const argsWithAuth = { ...props.parsedArgs };
    if (props.process !== "auth" && "auth" in processConfig.args && !argsWithAuth.auth) {
      const currentAuth = cliAuthManager.getCurrentAuth();
      if (currentAuth) {
        argsWithAuth.auth = currentAuth;
      }
    }

    await processFunction(argsWithAuth);
  } catch (error) {
    console.error(`Error executing process '${props.process}':`, error);
  }
};
