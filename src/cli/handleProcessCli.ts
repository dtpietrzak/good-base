import { type Processes, processes, type ProcessKeys } from "../_constants.ts";
import { colorizeJson } from "../_utils/colorizeJson.ts";
import { logger } from "../_utils/logger/index.ts";
import { cliAuthManager } from "./authManager.ts";
import { bold, cyan, red } from "jsr:@std/fmt/colors";

type ProcessSwitchProps<C extends ProcessKeys = ProcessKeys> = {
  process: C;
  parsedArgs: Processes<C>["args"];
};

export const processHandler = async (props: ProcessSwitchProps) => {
  const authToken = cliAuthManager.getCurrentAuth();

  try {
    if (!props.process) {
      throw new Error(
        "No process provided. Use 'help' for available processes.",
      );
    }

    const processConfig = processes[props.process];

    if (!processConfig) {
      throw new Error(
        `Unknown process: ${props.process}. Use 'help' for available processes.`,
      );
    }

    const requiredArgs = Object.entries(processConfig.args)
      .filter(([, desc]) => !desc.startsWith("(Optional)"))
      .map(([argName]) => argName);

    const missingArgs = requiredArgs.filter((arg) =>
      !(arg in props.parsedArgs)
    );

    if (missingArgs.length > 0) {
      const argStrings = Object.entries(processConfig.args).map(
        ([argName, description]) => {
          const alias = argName[0]; // Use first letter as alias
          const argRequired = !description.startsWith("(Optional)");
          return `\n  --${argName} ${
            argRequired ? "" : "(optional)"
          } <${description}> or -${alias}`;
        },
      );

      const usageNotes = `\nUsage Notes: ${bold(props.process)} ${
        argStrings.join(" ")
      }`;
      console.info(cyan(usageNotes));
      throw new Error(`Missing required arguments: ${missingArgs.join(", ")}`);
    }

    const processFunction = processConfig.function;
    if (!processFunction) {
      throw new Error(`No function defined for process '${props.process}'.`);
    }

    // Auto-inject auth token for commands that need it (except auth command itself)
    const argsWithAuth = { ...props.parsedArgs };
    if (
      props.process !== "auth" && "auth" in processConfig.args &&
      !argsWithAuth.auth
    ) {
      const currentAuth = cliAuthManager.getCurrentAuth();
      if (currentAuth) {
        argsWithAuth.auth = currentAuth;
      }
    }

    const processResponse = await processFunction(argsWithAuth);

    // Syntax-highlighted output
    console.log("\n" + colorizeJson(processResponse) + "\n");
    await logger({ type: "command" }).command({
      timestamp: new Date().toISOString(),
      command: props.process,
      args: props.parsedArgs,
      auth: authToken ?? null,
      event: "RESULT",
    });
  } catch (caughtError) {
    console.error(red("\n" + caughtError + "\n"));
    await logger({ type: "command" }).command({
      timestamp: new Date().toISOString(),
      command: props.process,
      args: props.parsedArgs,
      auth: authToken ?? null,
      event: "ERROR",
    });
  }
};
