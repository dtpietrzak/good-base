import { DatabaseSync } from "node:sqlite";
import { Directories, GoodBaseConfig } from "./_types.ts";

let config: GoodBaseConfig;
let directories: Directories;
let authDb: DatabaseSync;

export const setConfig = (newConfig: GoodBaseConfig) => {
  config = newConfig;
};

export const getConfig = (): GoodBaseConfig => {
  if (!config) {
    throw new Error(
      "Configuration not initialized. Call initializeConfig() first.",
    );
  }
  return config;
};

export const setDirectories = (newDirectories: Directories) => {
  directories = newDirectories;
};

export const getDirectories = (): Directories => {
  if (!directories) {
    throw new Error(
      "Directories not initialized. Call initializeConfig() first.",
    );
  }
  return directories;
};

export const setAuthDb = (newAuthDb: DatabaseSync) => {
  authDb = newAuthDb;
};

export const getAuthDb = (): DatabaseSync => {
  if (!authDb) {
    throw new Error(
      "AuthDb not initialized. Call initializeConfig() first.",
    );
  }
  return authDb;
};
