import { cliAuthManager } from "../cli/authManager.ts";

type AuthCommandProps = {
  key?: string;
  close?: string;
  status?: string;
};

export default function auth(props: AuthCommandProps) {
  const { key, close, status } = props;

  // Handle --close flag
  if (close !== undefined) {
    cliAuthManager.clearAuth();
    return { success: true, data: "Auth cleared" };
  }

  // Handle --status flag
  if (status !== undefined) {
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
        timeoutMinutes: authInfo.timeoutMinutes 
      } 
    };
  }

  // Handle setting auth key (support both --key flag and positional argument)
  if (key) {
    cliAuthManager.setAuth(key);
    return { success: true, data: "Auth set successfully" };
  }

  // No arguments provided - show usage
  console.log("Usage:");
  console.log("  auth --key <token>  - Set authentication token");
  console.log("  auth --close        - Clear current authentication");
  console.log("  auth --status       - Show current auth status");
  console.log("");
  
  const authInfo = cliAuthManager.getAuthInfo();
  if (authInfo.hasAuth) {
    const remainingMinutes = cliAuthManager.getRemainingMinutes();
    if (remainingMinutes === null) {
      console.log("Current: ✅ Auth active (no expiration)");
    } else if (remainingMinutes > 0) {
      console.log(`Current: ✅ Auth active (expires in ${remainingMinutes} minutes)`);
    } else {
      console.log("Current: ⚠ Auth expired");
    }
  } else {
    console.log("Current: ❌ No active auth session");
  }

  return { success: true, data: "Auth command help displayed" };
}