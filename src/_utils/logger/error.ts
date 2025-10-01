import { red } from "@std/fmt/colors";

const parseError = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
};

/**
 * first arg can be either string or Error, all other args are strings
 * @param error
 * @param args
 */
export const throwError = (error: unknown, ...args: string[]): never => {
  console.error("\n", red(parseError(error)), "\n",red(args.join(" ")));
  if (error instanceof Error) {
    throw error;
  } else {
    throw new Error(parseError(error));
  }
};
