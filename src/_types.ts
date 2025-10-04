import type { z } from "npm:zod";

export type Command = {
  command: string;
  args: Record<string, string>;
  description: string;
  on: { cli: boolean; http: boolean };
};

export type ArgDefinition<T extends z.ZodTypeAny = z.ZodTypeAny> = {
  schema: T;
  description: string;
};

export type ProcessWithSchema<
  T extends Record<string, z.ZodTypeAny> = Record<string, z.ZodTypeAny>,
> = {
  command: string;
  args: { [K in keyof T]: ArgDefinition<T[K]> };
  description: string;
  // deno-lint-ignore no-explicit-any
  function: (args: any) => Promise<ProcessResponse> | ProcessResponse;
  on: { cli: boolean; http: boolean };
};

export type Process = Command & {
  // deno-lint-ignore no-explicit-any
  function: (args: any) => Promise<ProcessResponse> | ProcessResponse;
};

export type ProcessResponse = { success: boolean; data: unknown };

export type ApiResponse = {
  success: boolean;
  data?: unknown;
  error?: string | Record<string, string[] | undefined>;
  info?: string | object;
};
