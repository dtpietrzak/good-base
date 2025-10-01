export type CommandLog = {
  event: "CALL" | "RESULT" | "ERROR";
  timestamp: string;
  auth: string | null;
  command: string;
  args: Record<string, unknown>;
};

export type RequestLog = {
  event: "REQUEST" | "RESPONSE" | "ERROR";
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  durationMs?: number;
  error?: string;
};

export type GeneralLogOption = {
  type: "general";
};

export type DatabaseLogOption = {
  type: "database";
  dbName: string;
};

export type CommandLogOption = {
  type: "command";
};

export type RequestLogOption = {
  type: "request";
};

export type LoggerOptions =
  | GeneralLogOption
  | DatabaseLogOption
  | CommandLogOption
  | RequestLogOption;
