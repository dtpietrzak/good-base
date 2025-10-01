import { red } from "@std/fmt/colors";
import { GoodBaseConfig } from "./_types.ts";

import { z } from "npm:zod";

export const validateConfig = (config: GoodBaseConfig): void => {
  //   validate config
  if (config.logging.level === "debug") {
    console.log("Validating configuration...");
  }

  const GoodBaseConfigSchema = z.object({
    databases: z.record(
      z.string().min(1),
      z.object({
        databaseDirectory: z.string().min(1).optional(),
        enabledBackups: z.boolean(),
        backupDirectory: z.string().min(1).optional(),
        backupInterval: z.number().min(0).optional(),
        maxFileSize: z.number().min(1),
      }),
    ),
    server: z.object({
      host: z.string().min(1),
      port: z.number().min(1).max(65535),
      enableCors: z.boolean(),
      corsOrigins: z.array(z.string().min(1)),
      requestTimeout: z.number().min(1),
      maxBodySize: z.number().min(0),
    }),
    auth: z.object({
      required: z.boolean(),
      defaultToken: z.string().min(1).optional(),
      validationMethod: z.enum(["static", "jwt", "external"]),
      jwtSecret: z.string().min(1).optional(),
      externalEndpoint: z.string().min(1).optional(),
    }),
    logging: z.object({
      level: z.enum(["debug", "info", "warn", "error", "none"]),
      enableCommandLogging: z.boolean(),
      enableRequestLogging: z.boolean(),
      maxLogFileSize: z.number().min(1),
      maxLogFiles: z.number().min(1),
      logDirectory: z.string().min(1).optional(),
    }),
    cli: z.object({
      historyFile: z.string().min(1).optional(),
      historySize: z.number().min(1),
      persistentHistory: z.boolean(),
      enableColors: z.boolean().optional(),
      prompt: z.string().min(1),
      authTimeoutMinutes: z.number().min(0),
    }),
  });

  const parseResult = GoodBaseConfigSchema.safeParse(config);

  if (!parseResult.success) {
    const zodMessage = parseResult.error.message;

    console.error(
      red(
        `Configuration validation failed with the following issues:\n${zodMessage}`,
      ),
    );

    Deno.exit(1);
  }

  if (config.logging.level === "debug") {
    console.log("Configuration is valid.");
  }
};
