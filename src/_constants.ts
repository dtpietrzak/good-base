import type { Command, Process } from "./_types.ts";
import echo from "./processes/echo.ts";
import create from "./processes/ops/create.ts";
import read from "./processes/ops/read.ts";
import config from "./processes/config.ts";
import auth from "./processes/auth.ts";
import databaseCreate from "./processes/database/database-create.ts";
import databaseList from "./processes/database/database-list.ts";
import databaseDelete from "./processes/database/database-delete.ts";

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

export const processes: Record<string, Process> = {
  echo: {
    command: "echo",
    args: { "text": "Text to echo back" },
    description: "Echo back any text you type",
    function: echo,
    on: { cli: true, http: false },
  } as const,
  read: {
    command: "read",
    args: {
      db: "Database to read from",
      index: "Index of the item to read",
      key: "Key of the item to read",
      auth: "Authentication token",
    },
    description: "Read an item by index and key",
    function: read,
    on: { cli: true, http: true },
  } as const,
  create: {
    command: "create",
    args: {
      db: "Database to create the item in",
      index: "Index of the item to create",
      key: "Key of the item to create",
      value: "Value to create",
      auth: "Authentication token",
      upsert:
        "(Optional) Whether to upsert if the key exists (true/false) default: true",
    },
    description: "Create an item with an index, key and value",
    function: create,
    on: { cli: true, http: true },
  } as const,
  search: {
    command: "search",
    args: {
      db: "Database to search in",
      index: "Index of the item to search",
      query: "Query to search for",
      auth: "Authentication token",
      limit: "(Optional) Limit the number of results returned",
      offset: "(Optional) Offset the results by this number",
    },
    description: "Search for items in an index",
    function: () => {
      throw new Error("Not implemented yet");
    },
    on: { cli: true, http: true },
  } as const,
  "index-create": {
    command: "index-create",
    args: {
      db: "Database to create the index in",
      name: "Name of the index to create",
      level:
        `Level of the indexing (match: only index exact matches, traverse: index keys to be retrieved in sorted orders, full: index all values for full text search) - For more details use the index-help command.`,
      field: "Field to index",
      auth: "Authentication token",
    },
    description: "Create a new index",
    function: () => {
      throw new Error("Not implemented yet");
    },
    on: { cli: true, http: true },
  } as const,
  "index-list": {
    command: "index-list",
    args: {
      db: "Database to list indexes from",
      auth: "Authentication token",
    },
    description: "List all indexes",
    function: () => {
      throw new Error("Not implemented yet");
    },
    on: { cli: true, http: true },
  } as const,
  "index-delete": {
    command: "index-delete",
    args: {
      db: "Database to delete the index from",
      name: "Name of the index to delete",
      auth: "Authentication token",
    },
    description: "Delete an index",
    function: () => {
      throw new Error("Not implemented yet");
    },
    on: { cli: true, http: true },
  } as const,
  config: {
    command: "config",
    args: {
      key:
        "(Optional) Specific configuration key to show (e.g., 'database.dataDirectory')",
    },
    description: "Show or manage configuration settings",
    function: config,
    on: { cli: true, http: false },
  } as const,
  auth: {
    command: "auth",
    args: {
      key: "(Optional) Authentication token to set",
      close: "(Optional) Clear current authentication session",
      status: "(Optional) Show current authentication status",
    },
    description: "Manage CLI authentication session",
    function: auth,
    on: { cli: true, http: false },
  } as const,
  "database-create": {
    command: "database-create",
    args: {
      name: "Name of the database to create",
      description: "(Optional) Description of the database",
      auth: "Authentication token",
    },
    description: "Create a new database",
    function: databaseCreate,
    on: { cli: true, http: true },
  } as const,
  "database-list": {
    command: "database-list",
    args: {
      verbose: "(Optional) Show detailed information about each database",
      auth: "Authentication token",
    },
    description: "List all databases",
    function: databaseList,
    on: { cli: true, http: true },
  } as const,
  "database-delete": {
    command: "database-delete",
    args: {
      name: "Name of the database to delete",
      force: "(Optional) Skip confirmation prompt",
      auth: "Authentication token",
    },
    description: "Delete a database and all its contents",
    function: databaseDelete,
    on: { cli: true, http: true },
  } as const,
} as const;
