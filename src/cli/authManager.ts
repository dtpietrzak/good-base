import { getCliConfig } from "../config/index.ts";

export interface AuthSession {
  token: string;
  expiresAt?: number; // timestamp in milliseconds, undefined means no timeout
}

export class CliAuthManager {
  private currentAuth: AuthSession | null = null;
  
  constructor() {}

  /**
   * Set the authentication token for CLI commands
   */
  setAuth(token: string): void {
    const config = getCliConfig();
    const expiresAt = config.authTimeoutMinutes > 0 
      ? Date.now() + (config.authTimeoutMinutes * 60 * 1000)
      : undefined;
    
    this.currentAuth = {
      token,
      expiresAt,
    };

    if (config.authTimeoutMinutes > 0) {
      console.log(`✓ Auth set. Will expire in ${config.authTimeoutMinutes} minutes.`);
    } else {
      console.log(`✓ Auth set (no expiration).`);
    }
  }

  /**
   * Clear the current authentication
   */
  clearAuth(): void {
    this.currentAuth = null;
    console.log("✓ Auth cleared.");
  }

  /**
   * Get the current auth token if valid (not expired)
   */
  getCurrentAuth(): string | null {
    if (!this.currentAuth) {
      return null;
    }

    // Check if auth has expired
    if (this.currentAuth.expiresAt && Date.now() > this.currentAuth.expiresAt) {
      console.log("⚠ Auth session expired. Please authenticate again.");
      this.currentAuth = null;
      return null;
    }

    return this.currentAuth.token;
  }

  /**
   * Check if there's a valid auth session
   */
  hasValidAuth(): boolean {
    return this.getCurrentAuth() !== null;
  }

  /**
   * Get auth session info for display
   */
  getAuthInfo(): { hasAuth: boolean; expiresAt?: number; timeoutMinutes: number } {
    const config = getCliConfig();
    return {
      hasAuth: this.hasValidAuth(),
      expiresAt: this.currentAuth?.expiresAt,
      timeoutMinutes: config.authTimeoutMinutes,
    };
  }

  /**
   * Get remaining time in minutes before auth expires
   */
  getRemainingMinutes(): number | null {
    if (!this.currentAuth?.expiresAt) {
      return null; // No expiration
    }

    const remainingMs = this.currentAuth.expiresAt - Date.now();
    if (remainingMs <= 0) {
      return 0; // Expired
    }

    return Math.ceil(remainingMs / (60 * 1000));
  }
}

// Global instance for CLI
export const cliAuthManager = new CliAuthManager();