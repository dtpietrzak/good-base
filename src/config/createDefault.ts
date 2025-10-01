import { path } from "../_utils/path.ts";

export const createDefault = async (configPath: string) => {
  const configFileName = "good-base.config.js";
  const configFullPath = path(configPath, configFileName);

  const exampleConfigUrl = new URL(
    "../../good-base.config.example.js",
    import.meta.url,
  );
  const exampleConfigContent = await Deno.readTextFile(exampleConfigUrl);

  await Deno.writeTextFile(
    configFullPath,
    exampleConfigContent,
  );
};
