export type Command = {
  command: string;
  args: Record<string, string>;
  description: string;
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
  error?: string;
  info?: string | object;
};
