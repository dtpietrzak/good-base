#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

/**
 * Test script to verify OS-specific directory configuration
 */

import { getAppDirectories, ensureAppDirectories } from "../src/config/directories.ts";
import { ConfigLoader } from "../src/config/loader.ts";

console.log("🔧 Testing OS-specific directory configuration...\n");

// Test 1: Directory resolution
console.log("📁 OS-specific directory resolution:");
const dirs = getAppDirectories("good-base");
console.log(`  Base directory: ${dirs.base}`);
console.log(`  Data directory: ${dirs.data}`);
console.log(`  Config directory: ${dirs.config}`);
console.log(`  Logs directory: ${dirs.logs}`);
console.log(`  Backups directory: ${dirs.backups}`);
console.log(`  Cache directory: ${dirs.cache}`);

// Test 2: Environment variable override
console.log("\n🌍 Environment variable override test:");
const originalDataDir = Deno.env.get("DATA_DIR");
Deno.env.set("DATA_DIR", "/tmp/custom-good-base-test");
const overrideDirs = getAppDirectories("good-base");
console.log(`  With DATA_DIR override: ${overrideDirs.base}`);
if (originalDataDir) {
  Deno.env.set("DATA_DIR", originalDataDir);
} else {
  Deno.env.delete("DATA_DIR");
}

// Test 3: Development vs production
console.log("\n🚀 Development vs Production mode:");
const originalNodeEnv = Deno.env.get("NODE_ENV");

Deno.env.set("NODE_ENV", "development");
const devDirs = getAppDirectories("good-base");
console.log(`  Development mode: ${devDirs.base}`);

Deno.env.set("NODE_ENV", "production");
const prodDirs = getAppDirectories("good-base");
console.log(`  Production mode: ${prodDirs.base}`);

if (originalNodeEnv) {
  Deno.env.set("NODE_ENV", originalNodeEnv);
} else {
  Deno.env.delete("NODE_ENV");
}

// Test 4: Directory creation
console.log("\n📂 Testing directory creation:");
try {
  await ensureAppDirectories("good-base-test");
  console.log("  ✅ Directory creation successful");
  
  // Clean up test directories
  try {
    await Deno.remove(getAppDirectories("good-base-test").base, { recursive: true });
    console.log("  🧹 Test directories cleaned up");
  } catch {
    // Ignore cleanup errors
  }
} catch (error) {
  console.log(`  ❌ Directory creation failed: ${error}`);
}

// Test 5: Configuration loading
console.log("\n⚙️ Testing configuration with directory creation:");
try {
  const loader = new ConfigLoader();
  const config = await loader.load();
  console.log(`  ✅ Config loaded successfully`);
  console.log(`  Data directory: ${config.database.dataDirectory}`);
  console.log(`  Backup directory: ${config.database.backupDirectory}`);
  console.log(`  Log directory: ${config.logging.logDirectory}`);
  console.log(`  History file: ${config.cli.historyFile}`);
} catch (error) {
  console.log(`  ❌ Config loading failed: ${error}`);
}

console.log("\n✨ Directory configuration test complete!");