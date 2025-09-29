import { processes, ProcessKeys } from "../_constants.ts";
import { ApiResponse } from "../_types.ts";

export async function handleProcessRequest(
  process: string,
  body: Record<string, unknown>,
  authToken: string | null,
): Promise<ApiResponse> {
  const processKey = process as ProcessKeys;
  const processConfig = processes[processKey];

  if (!processConfig) {
    return {
      success: false,
      error: `Unknown process: ${process}`,
    };
  }

  // Add auth token to the body if provided
  const requestArgs = { ...body };
  if (authToken && !requestArgs.auth) {
    requestArgs.auth = authToken;
  }

  // Validate required arguments
  const requiredArgs = Object.entries(processConfig.args)
    .filter(([, desc]) => !desc.startsWith("(Optional)"))
    .map(([argName]) => argName);

  const missingAuth = requiredArgs.includes("auth") && !requestArgs["auth"];
  if (missingAuth) {
    return {
      success: false,
      error: `Missing required authorization`,
      info: {
        headers: {
          authorization: "Bearer <token>",
        },
      },
    };
  }

  const missingArgs = requiredArgs
    .filter((arg) => arg !== "auth")
    .filter((arg) => !(arg in requestArgs));

  if (missingArgs.length > 0) {
    return {
      success: false,
      error: `Missing required arguments: ${missingArgs.join(", ")}`,
      info: {
        usage: {
          process: process,
          body: Object.entries(processConfig.args).reduce(
            (acc, [key, value]) => {
              if (key === "auth") return acc;
              acc[key] = value;
              return acc;
            },
            {} as Record<string, string>,
          ),
        },
      },
    };
  }

  try {
    const processFunction = processConfig.function;
    if (!processFunction) {
      return {
        success: false,
        error: `No function defined for process '${process}'`,
      };
    }

    // Execute the process function
    const result = await processFunction(requestArgs);

    return {
      success: true,
      data: result.data,
      info: `Process '${process}' executed successfully`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error executing process '${process}': ${errorMessage}`,
    };
  }
}
