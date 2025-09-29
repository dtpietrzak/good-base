#!/usr/bin/env -S deno run --allow-read --allow-net

import { runCli } from "./cli/runCli.ts";
import { handleHttpRequest } from "./server/handleHttpRequest.ts";

const PORT = 5555;

async function main() {
  console.log("\n\ngood-base ready\n");

  const server = Deno.serve({
    port: PORT,
    onListen: () => {},
  }, handleHttpRequest);

  console.log("CLI - Type 'exit' to quit - Type 'help' for commands");
  console.log("====================================================");
  console.log(`HTTP Server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`   GET  /help - Get some help`);
  console.log(`   POST /<command> - Execute a command\n`);

  await runCli();

  // Shutdown server when CLI exits
  await server.shutdown();
}

if (import.meta.main) {
  main();
}
