import { bold, cyan, gray, green, magenta, yellow } from "jsr:@std/fmt/colors";

export function colorizeJson(json: unknown, indent = 2): string {
  function colorize(value: unknown, level = 0): string {
    const pad = " ".repeat(level * indent);
    if (typeof value === "string") {
      return green('"' + value.replace(/"/g, '\\"') + '"');
    } else if (typeof value === "number") {
      return yellow(String(value));
    } else if (typeof value === "boolean") {
      return magenta(String(value));
    } else if (value === null) {
      return gray("null");
    } else if (Array.isArray(value)) {
      if (value.length === 0) return cyan("[]");
      return "[\n" + value.map((v) =>
        pad + " ".repeat(indent) + colorize(v, level + 1)
      ).join(",\n") + "\n" + pad + "]";
    } else if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value);
      if (entries.length === 0) return cyan("{}");
      return "{\n" + entries.map(([k, v]) =>
        pad + " ".repeat(indent) + bold(cyan('"' + k + '"')) + ": " +
        colorize(v, level + 1)
      ).join(",\n") + "\n" + pad + "}";
    }
    return String(value);
  }
  return colorize(json);
}
