import type { GoodBaseConfig } from "./_types.ts";

/**
 * Recursively merges environment variable overrides into a configuration object.
 * Environment variables should be prefixed with "GOOD_BASE_" and use nested object notation.
 * 
 * Examples:
 * - GOOD_BASE_SERVER_PORT=8080 -> config.server.port = 8080
 * - GOOD_BASE_DATABASES_MAIN_MAX_FILE_SIZE=200 -> config.databases.main.maxFileSize = 200
 * - GOOD_BASE_AUTH_REQUIRED=true -> config.auth.required = true
 * - GOOD_BASE_LOGGING_LEVEL=debug -> config.logging.level = "debug"
 * 
 * @param config - The base configuration object to merge overrides into
 * @returns A new configuration object with environment variable overrides applied
 */
export function mergeEnvOverrides(config: GoodBaseConfig): GoodBaseConfig {
  // Create a deep copy of the config to avoid mutating the original
  const mergedConfig = deepClone(config);
  
  // Get all environment variables that start with our prefix
  const envPrefix = "GOOD_BASE_";
  const envOverrides: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(Deno.env.toObject())) {
    if (key.startsWith(envPrefix) && value !== undefined) {
      // Remove the prefix and convert to lowercase
      const configKey = key.slice(envPrefix.length).toLowerCase();
      envOverrides[configKey] = value;
    }
  }
  
  // Apply each environment variable override
  for (const [envKey, envValue] of Object.entries(envOverrides)) {
    applyEnvOverride(mergedConfig, envKey, envValue);
  }
  
  return mergedConfig;
}

/**
 * Applies a single environment variable override to the configuration object.
 * Handles nested object paths and type conversion.
 * 
 * @param config - The configuration object to modify
 * @param envKey - The environment variable key (without prefix, lowercase)
 * @param envValue - The string value from the environment variable
 */
function applyEnvOverride(config: Record<string, unknown>, envKey: string, envValue: string): void {
  // Split the key into path segments (e.g., "server_port" -> ["server", "port"])
  const pathSegments = envKey.split("_");
  
  // Navigate to the target object
  let current: Record<string, unknown> = config;
  
  // Process all segments except the last one (or last few that form the final property)
  let i = 0;
  while (i < pathSegments.length - 1) {
    const segment = pathSegments[i];
    
    // Create nested object if it doesn't exist or isn't an object
    if (!(segment in current) || !isRecord(current[segment])) {
      current[segment] = {};
    }
    
    current = current[segment] as Record<string, unknown>;
    i++;
    
    // Check if the remaining segments form a valid camelCase property
    const remainingSegments = pathSegments.slice(i);
    const potentialKey = convertToCamelCase(remainingSegments.join("_"));
    
    if (potentialKey in current) {
      // Found the property, set it and return
      const convertedValue = convertEnvValue(envValue, current[potentialKey]);
      current[potentialKey] = convertedValue;
      return;
    }
  }
  
  // If we get here, treat the last segment as the final key
  const finalKey = pathSegments[pathSegments.length - 1];
  const convertedValue = convertEnvValue(envValue, current[finalKey]);
  current[finalKey] = convertedValue;
}

/**
 * Converts underscore-separated words to camelCase
 */
function convertToCamelCase(str: string): string {
  return str.replace(/_(.)/g, (_, letter) => letter.toUpperCase());
}

/**
 * Type guard to check if a value is a Record<string, unknown>
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Converts a string environment variable value to the appropriate type
 * based on the existing value in the configuration.
 * 
 * @param envValue - The string value from the environment variable
 * @param existingValue - The existing value in the config (used for type inference)
 * @returns The converted value with the appropriate type
 */
function convertEnvValue(envValue: string, existingValue: unknown): unknown {
  // Handle null/undefined existing values - default to string
  if (existingValue === null || existingValue === undefined) {
    return tryParseValue(envValue);
  }
  
  // Convert based on the type of the existing value
  const existingType = typeof existingValue;
  
  switch (existingType) {
    case "boolean":
      return parseBoolean(envValue);
    
    case "number":
      return parseNumber(envValue);
    
    case "string":
      return envValue;
    
    case "object":
      if (Array.isArray(existingValue)) {
        return parseArray(envValue);
      }
      // For objects, try to parse as JSON, otherwise return as string
      return tryParseJson(envValue) ?? envValue;
    
    default:
      return tryParseValue(envValue);
  }
}

/**
 * Attempts to parse a string value into the most appropriate type.
 */
function tryParseValue(value: string): unknown {
  // Try boolean first
  if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
    return parseBoolean(value);
  }
  
  // Try number
  const numValue = parseNumber(value);
  if (!isNaN(numValue)) {
    return numValue;
  }
  
  // Try JSON
  const jsonValue = tryParseJson(value);
  if (jsonValue !== null) {
    return jsonValue;
  }
  
  // Default to string
  return value;
}

/**
 * Parses a string as a boolean value.
 */
function parseBoolean(value: string): boolean {
  const lower = value.toLowerCase().trim();
  return lower === "true" || lower === "1" || lower === "yes" || lower === "on";
}

/**
 * Parses a string as a number.
 */
function parseNumber(value: string): number {
  const trimmed = value.trim();
  
  // Handle integers
  if (/^-?\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  
  // Handle floats
  if (/^-?\d*\.\d+$/.test(trimmed)) {
    return parseFloat(trimmed);
  }
  
  return NaN;
}

/**
 * Parses a string as an array. Supports comma-separated values and JSON arrays.
 */
function parseArray(value: string): unknown[] {
  const trimmed = value.trim();
  
  // Try parsing as JSON array first
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const jsonResult = tryParseJson(trimmed);
    if (Array.isArray(jsonResult)) {
      return jsonResult;
    }
  }
  
  // Fall back to comma-separated values
  return trimmed.split(",").map(item => item.trim()).filter(item => item.length > 0);
}

/**
 * Attempts to parse a string as JSON, returning null if parsing fails.
 */
function tryParseJson(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Creates a deep clone of an object.
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}
