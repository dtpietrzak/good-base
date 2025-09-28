import echo from "./echo.ts";
import insert from "./insert.ts";
import read from "./read.ts";

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

export const appCommands = {
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
  insert: {
    command: "insert",
    args: {
      index: "Index of the item to insert into",
      key: "Key of the item to insert",
      value: "Value to insert",
      auth: "Authentication token",
      upsert: "Whether to upsert if the key exists (true/false) default: true",
    },
    description: "Insert an item with an index, key and value",
    function: insert,
  } as const,
} as const;
