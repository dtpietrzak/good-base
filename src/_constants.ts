import type { Command, Process } from "./_types.ts";
import echo from "./processes/echo.ts";
import create from "./processes/create.ts";
import read from "./processes/read.ts";

export const types = [
  "string",
  "number",
  "boolean",
  "array",
  "object",
  "date",
  "file",
  "null",
] as const;

export type ProcessKeys = keyof typeof processes;
export type Processes<C extends ProcessKeys> = typeof processes[C];

export const rootCommands: Command[] = [
  {
    command: "help",
    args: {},
    description: "Show this help message",
  } as const,
  {
    command: "exit",
    args: {},
    description: "Exit the CLI",
  } as const,
] as const;

export const processes: Record<string, Process> = {
  echo: {
    command: "echo",
    args: { "text": "Text to echo back" },
    description: "Echo back any text you type",
    function: echo,
  } as const,
  read: {
    command: "read",
    args: {
      index: "Index of the item to read",
      key: "Key of the item to read",
      auth: "Authentication token",
    },
    description: "Read an item by index and key",
    function: read,
  } as const,
  create: {
    command: "create",
    args: {
      index: "Index of the item to create",
      key: "Key of the item to create",
      value: "Value to create",
      auth: "Authentication token",
      upsert:
        "(Optional) Whether to upsert if the key exists (true/false) default: true",
    },
    description: "Create an item with an index, key and value",
    function: create,
  } as const,
} as const;
