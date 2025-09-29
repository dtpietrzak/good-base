#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env

import { runCli } from "./cli/runCli.ts";
import { handleHttpRequest } from "./server/handleHttpRequest.ts";
import {
  getDatabaseConfig,
  getServerConfig,
  initializeConfig,
} from "./config/index.ts";

async function main() {
  console.log("\n\ngood-base initializing...\n");

  // Initialize configuration system
  console.log("Loading configuration from: ", Deno.cwd());
  try {
    await initializeConfig();
    const serverConfig = getServerConfig();
    const dbConfig = getDatabaseConfig();
    
    console.log(`Database directory: ${dbConfig.dataDirectory}`);
    console.log(`Backups enabled: ${dbConfig.enableBackups}`);    console.log("");

    const server = Deno.serve({
      port: serverConfig.port,
      hostname: serverConfig.host,
      onListen: () => {},
    }, handleHttpRequest);

    console.log("CLI - Type 'exit' to quit - Type 'help' for commands");
    console.log("====================================================");
    console.log(
      `HTTP Server running on http://${serverConfig.host}:${serverConfig.port}`,
    );
    console.log(`Available endpoints:`);
    console.log(`   GET  /           Basic system info`);
    console.log(`   GET  /help       Get some help`);
    console.log(`   POST /<command>  Execute a command\n`);

    await runCli();

    // Shutdown server when CLI exits
    await server.shutdown();
  } catch (error) {
    console.error("Failed to start good-base:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
