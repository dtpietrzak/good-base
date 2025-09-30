#!/usr/bin/env deno

/**
 * Test script to verify command logging functionality
 */

import { initializeConfig } from "../src/config/index.ts";
import { commandLogger } from "../src/cli/commandLogger.ts";
import { ensureAppDirs } from "../src/config/directories.ts";

async function testCommandLogging() {
  console.log("Testing command logging functionality...\n");

  // Initialize configuration
  const config = await initializeConfig();
  console.log("Logging config:", config.logging);
  
  // Ensure directories exist
  await ensureAppDirs();

  // Test logging some commands
  console.log("\n1. Logging test commands...");
  
  await commandLogger.logCommand({
    command: "echo",
    auth: "test-token-123",
    args: { text: "Hello World" },
    success: true,
  });

  await commandLogger.logCommand({
    command: "help",
    auth: null,
    args: {},
    success: true,
  });

  await commandLogger.logCommand({
    command: "create",
    auth: "test-token-456",
    args: { db: "mydb", index: "users", key: "user1", value: "John Doe" },
    success: false,
    error: "Database not found",
  });

  console.log("✓ Test commands logged\n");

  // Test reading logs
  console.log("2. Reading command logs...");
  
  const logs = await commandLogger.readCommandLogs(10);
  
  console.log(`Found ${logs.length} log entries:`);
  for (const log of logs) {
    const timestamp = new Date(log.timestamp).toLocaleString();
    const authDisplay = log.auth ? log.auth.substring(0, 8) + "..." : "none";
    const status = log.success ? "✓" : "✗";
    console.log(`  [${timestamp}] ${status} ${log.command} | auth: ${authDisplay}`);
  }

  console.log("\n✓ Command logging test completed successfully!");
}

if (import.meta.main) {
  try {
    await testCommandLogging();
  } catch (error) {
    console.error("Test failed:", error);
    Deno.exit(1);
  }
}