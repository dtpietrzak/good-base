#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env --allow-import

import { runCli } from "./cli/runCli.ts";
import { initializeConfig } from "./config/index.ts";
import { handleHttpRequest } from "./server/handleHttpRequest.ts";
import { timeoutWrapper } from "./server/timeoutWrapper.ts";
import {
  bold,
  brightMagenta,
  cyan,
  gray,
  green,
  setColorEnabled,
} from "@std/fmt/colors";

async function main() {
  console.log(brightMagenta("\n\ngood-base initializing...\n"));
  if (!Deno.env.get("DENO_ENV")) Deno.env.set("DENO_ENV", "production");

  try {
    const setup = await initializeConfig();
    if (setup.config.cli.enableColors === false) setColorEnabled(false);

    console.log(
      `${gray("Databases:")}\n${
        Object.keys(setup.config.databases).map((name) => `  - ${name}`)
          .join("\n")
      }`,
    );
    console.log("");

    const server = Deno.serve({
      port: setup.config.server.port,
      hostname: setup.config.server.host,
      onListen: () => {},
    }, async (request: Request) => {
      return await timeoutWrapper({
        request: request,
        requestHandler: handleHttpRequest,
        timeoutSeconds: setup.config.server.requestTimeout,
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
          bold(
            `http://${setup.config.server.host}:${setup.config.server.port}/`,
          )
        }`,
      ),
    );
    console.log(cyan(`   ${bold("GET  /")}           Basic system info`));
    console.log(cyan(`   ${bold("GET  /help")}       Get some help`));
    console.log(cyan(`   ${bold("POST /<command>")}  Execute a command\n`));

    await runCli(setup);

    // Shutdown server when CLI exits
    await server.shutdown();
  } catch (error) {
    console.error(error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
