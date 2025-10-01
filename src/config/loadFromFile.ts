import { gray } from "@std/fmt/colors";
import { path } from "../_utils/path.ts";
import type { GoodBaseConfig } from "./_types.ts";

export const loadConfigFromFile = async (
  configPath: string,
): Promise<GoodBaseConfig | undefined> => {
  const configFilePath = path(configPath, "good-base.config.js");
  console.log(`${gray("Loading configuration file:\n")}${configFilePath}`);
  
  // Check if file exists first
  try {
    await Deno.stat(configFilePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.log(`${gray("Config file not found at:")} ${configFilePath}`);
      return undefined;
    }
    // Re-throw other stat errors (permission issues, etc.)
    throw error;
  }
  
  try {
    const fileUrl = path(configPath, "good-base.config.js");
    const module = await import(fileUrl);
    return module.default as GoodBaseConfig;
  } catch (error) {
    console.error(error, `Failed to load config from ${configFilePath}`);
    return undefined;
  }
};
