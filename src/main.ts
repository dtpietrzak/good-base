#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --allow-import

import { runCli } from "./cli/runCli.ts";
import { handleHttpRequest } from "./server/handleHttpRequest.ts";
import { getConfig, initializeConfig } from "./config/index.ts";
import { timeoutWrapper } from "./server/timeoutWrapper.ts";
import { bold, brightMagenta, cyan, gray, green, red } from "jsr:@std/fmt/colors";

async function main() {
  console.log(brightMagenta("\n\ngood-base initializing...\n"));
  if (!Deno.env.get("DENO_ENV")) Deno.env.set("DENO_ENV", "production");

  try {
    await initializeConfig();
    const config = getConfig();

    console.log(
      `${gray("Database directory:")} ${config.database.dataDirectory}`,
    );
    console.log(`${gray("Backups enabled:")} ${config.database.enableBackups}`);
    console.log("");

    const server = Deno.serve({
      port: config.server.port,
      hostname: config.server.host,
      onListen: () => {},
    }, async (request: Request) => {
      return await timeoutWrapper({
        request: request,
        requestHandler: handleHttpRequest,
        timeoutSeconds: config.server.requestTimeout,
      });
    });

    console.log(
      green(
        `${bold("CLI")} - Type '${bold("exit")}' to quit - Type '${
          bold("help")
        }' for commands`,
      ),
    );
    console.log("====================================================");
    console.log(
      cyan(
        `${bold("Server")} running on ${
          bold(`http://${config.server.host}:${config.server.port}/`)
        }`,
      ),
    );
    console.log(cyan(`   ${bold("GET  /")}           Basic system info`));
    console.log(cyan(`   ${bold("GET  /help")}       Get some help`));
    console.log(cyan(`   ${bold("POST /<command>")}  Execute a command\n`));

    await runCli();

    // Shutdown server when CLI exits
    await server.shutdown();
  } catch (error) {
    console.error(red("\nFailed to start good-base:"), error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
