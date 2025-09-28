export interface Command {
  command: string;
  args: Record<string, string>;
  description: string;
}