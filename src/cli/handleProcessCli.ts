import { processes, type ProcessKeys } from "../_constants.ts";
import { colorizeJson } from "../_utils/colorizeJson.ts";
import { logger } from "../_utils/logger/index.ts";
import { cliAuthManager } from "./authManager.ts";
import { bold, cyan, red, yellow } from "@std/fmt/colors";
import { z } from "zod";

type CommandProcessHandlerProps = {
  processKey: ProcessKeys;
  parsedArgs: Record<string, string | boolean>;
  authToken: string | null;
};

export const processHandler = async (props: CommandProcessHandlerProps) => {
  try {
    if (!props.processKey) {
      throw new Error(
        "No process provided. Use 'help' for available processes.",
      );
    }

    const processConfig = processes[props.processKey];

    if (!processConfig) {
      throw new Error(
        `Unknown process: ${props.processKey}. Use 'help' for available processes.`,
      );
    }

    // Auto-inject auth token for commands that need it (except auth command itself)
    const argsToValidate = { ...props.parsedArgs };
    if (
      props.processKey !== "auth" && "auth" in processConfig.args &&
      !argsToValidate.auth
    ) {
      const currentAuth = cliAuthManager.getCurrentAuth();
      if (currentAuth) {
        argsToValidate.auth = currentAuth;
      }
    }

    // Build and validate with Zod schema
    const schema = buildZodSchema(processConfig.args);
    const validationResult = schema.safeParse(argsToValidate);

    if (!validationResult.success) {
      // Format validation errors
      const errors = validationResult.error.issues.map((err) => {
        const path = err.path.join(".");
        return `  - ${path || "(root)"}: ${err.message}`;
      }).join("\n");

      // Show usage information
      const argStrings = Object.entries(processConfig.args).map(
        ([argName, { schema, description }]) => {
          // TODO: fix later - make it consistent
          const _schema: z.ZodType = schema;
          const alias = argName[0]; // Use first letter as alias
          const isBoolean = _schema.type === "boolean" ||
            (_schema.type === "optional" &&
              // deno-lint-ignore no-explicit-any
              (schema as any)._def?.innerType?._def?.typeName ===
                "ZodBoolean") ||
            (_schema.type === "default" &&
              // deno-lint-ignore no-explicit-any
              (schema as any)._def?.innerType?._def?.typeName === "ZodBoolean");

          return `\n  --${argName}${
            isBoolean ? "" : " <value>"
          } ${description} ${yellow(`[-${alias}]`)}`;
        },
      );

      const usageNotes = `\nUsage: ${bold(props.processKey)}${
        argStrings.join("")
      }`;
      console.info(cyan(usageNotes));
      throw new Error(`Validation errors:\n${errors}`);
    }

    if (!processConfig.function) {
      throw new Error(`No function defined for process '${props.processKey}'.`);
    }

    const processResult = await processConfig.function(
      // deno-lint-ignore no-explicit-any
      validationResult.data as any,
    );

    // Syntax-highlighted output
    console.log("\n" + colorizeJson(processResult) + "\n");
    await logger({ type: "command" }).command({
      timestamp: new Date().toISOString(),
      command: props.processKey,
      args: props.parsedArgs,
      auth: props.authToken ?? null,
      event: "RESULT",
    });
  } catch (caughtError) {
    console.error(red("\n" + caughtError + "\n"));
    await logger({ type: "command" }).command({
      timestamp: new Date().toISOString(),
      command: props.processKey,
      args: props.parsedArgs,
      auth: props.authToken ?? null,
      event: "ERROR",
    });
  }
};

function buildZodSchema(
  args: Record<string, { schema: z.ZodTypeAny; description: string }>,
) {
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  for (const [key, { schema }] of Object.entries(args)) {
    schemaShape[key] = schema;
  }
  return z.object(schemaShape);
}
