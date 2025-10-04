export function parseArgs(args: string[]): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    // Check if it's a flag (starts with -- or -)
    if (arg.startsWith("--") || arg.startsWith("-")) {
      const key = arg.replace(/^-+/, ""); // Remove leading dashes
      i++;

      // Collect value until next flag or end of args
      const valueTokens: string[] = [];
      while (
        i < args.length && !args[i].startsWith("--") && !args[i].startsWith("-")
      ) {
        valueTokens.push(args[i]);
        i++;
      }

      // If no value tokens, treat as boolean flag (presence = true)
      if (valueTokens.length === 0) {
        result[key] = true;
      } else {
        // Join all tokens as the value, removing quotes if present
        let value = valueTokens.join(" ");

        // Remove surrounding quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        result[key] = value;
      }
    } else {
      i++;
    }
  }

  return result;
}
