import { bold, cyan, yellow } from "@std/fmt/colors";
import { cliAuthManager } from "../cli/authManager.ts";
import { getAuthDb } from "../_utils/authDb.ts";

type AuthCommandProps = {
  key?: string;
  close?: boolean;
  status?: boolean;
  add?: string;
  remove?: string;
  list?: boolean;
};

export default function auth(props: AuthCommandProps) {
  const { key, close, status, add, remove, list } = props;

  // Handle --close flag
  if (close === true) {
    cliAuthManager.clearAuth();
    return { success: true, data: "Auth cleared" };
  }

  // Handle --status flag
  if (status === true) {
    const authInfo = cliAuthManager.getAuthInfo();

    if (!authInfo.hasAuth) {
      console.log("❌ No active auth session");
      return { success: true, data: "No auth session" };
    }

    const remainingMinutes = cliAuthManager.getRemainingMinutes();

    if (remainingMinutes === null) {
      console.log("✅ Auth active (no expiration)");
    } else if (remainingMinutes > 0) {
      console.log(`✅ Auth active (expires in ${remainingMinutes} minutes)`);
    } else {
      console.log("⚠ Auth expired");
    }

    return {
      success: true,
      data: {
        hasAuth: authInfo.hasAuth,
        remainingMinutes,
        timeoutMinutes: authInfo.timeoutMinutes,
      },
    };
  }

  // Handle setting auth key (support both --key flag and positional argument)
  if (key) {
    const authDb = getAuthDb();
    const hasAuth = authDb.has(key); // Validate key exists in auth DB
    if (!hasAuth) {
      throw new Error("Invalid auth key");
    }

    cliAuthManager.setAuth(key);
    return { success: true, data: "Auth set successfully" };
  }

  if (add) {
    const authDb = getAuthDb();
    const added = authDb.add(add);
    if (!added) {
      return { success: false, data: add, error: "Failed to add" };
    }
    return { success: true, data: add };
  }

  if (remove) {
    const authDb = getAuthDb();
    const removed = authDb.remove(remove);
    if (!removed) {
      return { success: false, data: remove, error: "Failed to remove" };
    }
    return { success: true, data: remove };
  }

  if (list) {
    const authDb = getAuthDb();
    const keys = authDb.list(10, 0);
    return { success: true, data: keys };
  }

  // No arguments provided - show usage
  console.log(cyan(`\nUsage: ${bold("auth")}`));
  console.log(
    cyan(`  --key <token> Set authentication token ${yellow("[-k]")}`),
  );
  console.log(cyan(`  --close Clear current authentication ${yellow("[-c]")}`));
  console.log(cyan(`  --status Show current auth status ${yellow("[-s]")}`));
  console.log("");

  const authInfo = cliAuthManager.getAuthInfo();
  if (authInfo.hasAuth) {
    const remainingMinutes = cliAuthManager.getRemainingMinutes();
    if (remainingMinutes === null) {
      console.log("Current: ✅ Auth active (no expiration)");
    } else if (remainingMinutes > 0) {
      console.log(
        `Current: ✅ Auth active (expires in ${remainingMinutes} minutes)`,
      );
    } else {
      console.log("Current: ⚠ Auth expired");
    }
  } else {
    console.log("Current: ❌ No active auth session");
  }

  throw new Error("No arguments provided.");
}
