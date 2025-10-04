import type { Setup } from "./_types.ts";
import { createDefault } from "./createDefault.ts";
import { green } from "@std/fmt/colors";

import {
  ensureAppDirs,
  ensureDatabaseDirs,
  getBaseDir,
} from "./directories.ts";
import { loadConfigFromFile } from "./loadFromFile.ts";
import { mergeEnvOverrides } from "./mergeEnvOverrides.ts";
import { setConfig, setDirectories } from "./state.ts";
import { validateConfig } from "./validateConfig.ts";
import { path } from "../_utils/path.ts";
import { initializeAuthDb } from "../_utils/authDb.ts";

/** Initialize the configuration system */
export async function initializeConfig(): Promise<Setup> {
  // PLAN 01

  // check ENV vars for config path override
  // check for non-prod dev config path
  // check for default config path
  // attempt load config from file
  // if - found
  //   merge any env var overrides
  //       set config in state, mainly for logger asap
  //   validate config
  //   create any missing directories
  //       create app dirs
  //       create database dirs
  //       set directories in state
  //   warn if any config options are deprecated or unknown
  //   initialize auth.db SQLite db
  //   return config and all directories
  // else
  //   create default base paths and default config
  //   tell user the config was created and where to find it
  //   close the app so they can edit it

  // BEGIN 01

  // check ENV vars for config path override
  // check for non-prod dev config path
  // check for default config path
  const basePath: string = getBaseDir();

  // attempt load config from file
  const configFromFile = await loadConfigFromFile(`${basePath}/config`);

  // if - found
  if (configFromFile) {
    //   merge any env var overrides
    const config = mergeEnvOverrides(configFromFile);
    //       set config in state, mainly for logger asap
    setConfig(config);
    //   validate config
    validateConfig(config);
    //   create any missing directories
    //       create app dirs
    const appDirs = await ensureAppDirs();
    //       create database dirs
    const databaseDirs = Object.fromEntries(
      await Promise.all(
        Object.entries(config.databases).map(async ([dbName, dbConfig]) => {
          return [
            dbName,
            await ensureDatabaseDirs(
              appDirs.databases,
              dbName,
              dbConfig.backupDirectory,
            ),
          ];
        }),
      ),
    );
    //       set directories in state
    setDirectories({
      app: appDirs,
      databases: databaseDirs,
    });

    //   initialize auth.db SQLite db
    initializeAuthDb(
      path(appDirs.base, "auth.db"),
    );

    //   TODO: warn if any config options are deprecated or unknown

    //   return config and all directories
    return {
      config: config,
      directories: {
        app: appDirs,
        databases: databaseDirs,
      },
    };
  } else {
    //   create default base paths and default config
    const appDirs = await ensureAppDirs();
    //      put default config in the appDirs.config path
    //      dont do databaseDirs at all here since no dbs are configured
    await createDefault(appDirs.config);
    //   tell user the config was created and where to find it
    //   close the app so they can edit it
    console.error(
      green(
        `\n\nNo configuration found. A default config has been created at ${appDirs.config}. Please edit it before restarting the application.\n\n`,
      ),
    );
    Deno.exit(0);
  }
}
