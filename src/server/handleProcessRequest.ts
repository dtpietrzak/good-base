import { processes, ProcessKeys } from "../_constants.ts";
import { ApiResponse } from "../_types.ts";
import { z } from "zod";

type RequestProcessHandlerProps = {
  processKey: ProcessKeys;
  parsedArgs: Record<string, string | boolean>;
  authToken: string | null;
};

export const handleProcessRequest = async (
  props: RequestProcessHandlerProps,
): Promise<ApiResponse> => {
  if (!props.processKey) {
    throw new Error(
      "No process provided. Use '/help' for available processes.",
    );
  }

  const processConfig = processes[props.processKey];

  if (!processConfig) {
    return {
      success: false,
      error:
        `Unknown process: ${props.processKey}. Use '/help' for available processes.`,
    };
  }

  const argsToValidate = {
    ...props.parsedArgs,
    auth: props.authToken ?? undefined,
  };

  const schema = buildZodSchema(processConfig.args);
  const validationResult = schema.safeParse(argsToValidate);

  if (!validationResult.success) {
    const errors = z.flattenError(validationResult.error).fieldErrors;

    return {
      success: false,
      error: errors ?? "Invalid arguments provided",
    };
  }

  try {
    if (!processConfig.function) {
      return {
        success: false,
        error: `No function defined for process '${props.processKey}'`,
      };
    }

    const processResult = await processConfig.function(
      // deno-lint-ignore no-explicit-any
      validationResult.data as any,
    );

    if (!processResult.success) {
      return {
        success: false,
        // @ts-expect-error - processResult.error exists if success is false
        error: processResult?.error || `Process '${props.processKey}' failed`,
      };
    }

    return {
      success: true,
      data: processResult.data,
      info: `Process '${props.processKey}' executed successfully`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error executing process '${props.processKey}': ${errorMessage}`,
    };
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
