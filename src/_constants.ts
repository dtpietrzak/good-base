import type { Command, ProcessWithSchema } from "./_types.ts";
import { z } from "zod";
import echo from "./processes/echo.ts";
import create from "./processes/ops/create.ts";
import read from "./processes/ops/read.ts";
import config from "./processes/config.ts";
import auth from "./processes/auth.ts";
import databaseList from "./processes/database-list.ts";

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

export const indexLevels = [
  "match",
  "traverse",
  "full",
];

export type ProcessKeys = keyof typeof processes;
export type Processes<C extends ProcessKeys> = typeof processes[C];

// Helper to create optional description
const optional = (desc: string) => `(Optional) ${desc}`;

export const rootCommands: Command[] = [
  {
    command: "help",
    args: {},
    description: "Show this help message",
    on: { cli: true, http: true },
  } as const,
  {
    command: "index-help",
    args: {},
    description: "Show detailed information about index levels",
    on: { cli: true, http: true },
  } as const,
  {
    command: "exit",
    args: {},
    description: "Exit the CLI",
    on: { cli: true, http: true },
  } as const,
] as const;

export const processes = {
  echo: {
    command: "echo",
    args: {
      text: {
        schema: z.string(),
        description: "Text to echo back",
      },
    },
    description: "Echo back any text you type",
    function: echo,
    on: { cli: true, http: false },
  } satisfies ProcessWithSchema,
  read: {
    command: "read",
    args: {
      db: {
        schema: z.string(),
        description: "Database to read from",
      },
      index: {
        schema: z.string(),
        description: "Index of the item to read",
      },
      key: {
        schema: z.string(),
        description: "Key of the item to read",
      },
      auth: {
        schema: z.string(),
        description: "Authentication token*",
      },
    },
    description: "Read an item by index and key",
    function: read,
    on: { cli: true, http: true },
  } satisfies ProcessWithSchema,
  create: {
    command: "create",
    args: {
      db: {
        schema: z.string(),
        description: "Database to create the item in",
      },
      index: {
        schema: z.string(),
        description: "Index of the item to create",
      },
      key: {
        schema: z.string(),
        description: "Key of the item to create",
      },
      value: {
        schema: z.string(),
        description: "Value to create",
      },
      auth: {
        schema: z.string(),
        description: "Authentication token*",
      },
      upsert: {
        schema: z.boolean().optional().default(true),
        description: optional("Whether to upsert if the key exists (default: true)"),
      },
    },
    description: "Create an item with an index, key and value",
    function: create,
    on: { cli: true, http: true },
  } satisfies ProcessWithSchema,
  search: {
    command: "search",
    args: {
      db: {
        schema: z.string(),
        description: "Database to search in",
      },
      index: {
        schema: z.string(),
        description: "Index of the item to search",
      },
      query: {
        schema: z.string(),
        description: "Query to search for",
      },
      auth: {
        schema: z.string(),
        description: "Authentication token*",
      },
      limit: {
        schema: z.number().optional(),
        description: optional("Limit the number of results returned"),
      },
      offset: {
        schema: z.number().optional(),
        description: optional("Offset the results by this number"),
      },
    },
    description: "Search for items in an index",
    function: () => {
      throw new Error("Not implemented yet");
    },
    on: { cli: true, http: true },
  } satisfies ProcessWithSchema,
  "index-create": {
    command: "index-create",
    args: {
      db: {
        schema: z.string(),
        description: "Database to create the index in",
      },
      name: {
        schema: z.string(),
        description: "Name of the index to create",
      },
      level: {
        schema: z.enum(["match", "traverse", "full"]),
        description: "Level of the indexing (match: only index exact matches, traverse: index keys to be retrieved in sorted orders, full: index all values for full text search) - For more details use the index-help command.",
      },
      field: {
        schema: z.string(),
        description: "Field to index",
      },
      auth: {
        schema: z.string(),
        description: "Authentication token*",
      },
    },
    description: "Create a new index",
    function: () => {
      throw new Error("Not implemented yet");
    },
    on: { cli: true, http: true },
  } satisfies ProcessWithSchema,
  "index-list": {
    command: "index-list",
    args: {
      db: {
        schema: z.string(),
        description: "Database to list indexes from",
      },
      auth: {
        schema: z.string(),
        description: "Authentication token*",
      },
    },
    description: "List all indexes",
    function: () => {
      throw new Error("Not implemented yet");
    },
    on: { cli: true, http: true },
  } satisfies ProcessWithSchema,
  "index-delete": {
    command: "index-delete",
    args: {
      db: {
        schema: z.string(),
        description: "Database to delete the index from",
      },
      name: {
        schema: z.string(),
        description: "Name of the index to delete",
      },
      auth: {
        schema: z.string(),
        description: "Authentication token*",
      },
    },
    description: "Delete an index",
    function: () => {
      throw new Error("Not implemented yet");
    },
    on: { cli: true, http: true },
  } satisfies ProcessWithSchema,
  config: {
    command: "config",
    args: {
      key: {
        schema: z.string().optional(),
        description: optional("Specific configuration key to show (e.g., 'database.dataDirectory')"),
      },
    },
    description: "Show or manage configuration settings",
    function: config,
    on: { cli: true, http: false },
  } satisfies ProcessWithSchema,
  auth: {
    command: "auth",
    args: {
      key: {
        schema: z.string().optional(),
        description: optional("Authentication token to set, setting this allows you to skip passing --auth on each command. Use 'auth --close' to clear."),
      },
      add: {
        schema: z.string().optional(),
        description: optional("Add a new authentication uuid to the auth database"),
      },
      remove: {
        schema: z.string().optional(),
        description: optional("Remove an authentication uuid from the auth database"),
      },
      list: {
        schema: z.boolean().optional().default(false),
        description: optional("List all authentication uuids in the auth database"),
      },
      close: {
        schema: z.boolean().optional().default(false),
        description: optional("Clear current authentication session"),
      },
      status: {
        schema: z.boolean().optional().default(false),
        description: optional("Show current authentication status"),
      },
    },
    description: "Manage CLI authentication session",
    function: auth,
    on: { cli: true, http: false },
  } satisfies ProcessWithSchema,
  "database-list": {
    command: "database-list",
    args: {
      verbose: {
        schema: z.boolean().optional().default(false),
        description: optional("Show detailed information about each database"),
      },
      auth: {
        schema: z.string(),
        description: "Authentication token*",
      },
    },
    description: "List all databases",
    function: databaseList,
    on: { cli: true, http: true },
  } satisfies ProcessWithSchema,
} as const;
