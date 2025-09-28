export type Command = {
  command: string;
  args: Record<string, string | { description: string; required: boolean }>;
  description: string;
};

export type AppCommand = Command & {
  // deno-lint-ignore no-explicit-any
  function: (args: any) => Promise<void> | void;
};
