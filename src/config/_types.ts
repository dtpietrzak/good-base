import { z } from "zod";
import { GoodBaseConfigSchema } from "./_schema.ts";

export type GoodBaseConfig = z.infer<typeof GoodBaseConfigSchema>;

export type AppDirs = {
  base: string;
  config: string;
  logs: string;
  databases: string;
};

export type DatabaseDirs = {
  base: string;
  data: string;
  cache: string;
  logs: string;
  backups: string;
};

export type Directories = {
  app: AppDirs;
  databases: { [name: string]: DatabaseDirs };
};

export type Setup = {
  config: GoodBaseConfig;
  directories: Directories;
};

// for indexing later
export type IndexConfig = {
  /** Default index level for new indexes */
  defaultLevel: "match" | "traverse" | "full";
  /** Maximum number of items in an index before optimization kicks in */
  optimizationThreshold: number;
  /** Enable automatic index optimization */
  autoOptimize: boolean;
  /** Cache frequently accessed indexes in memory */
  enableCache: boolean;
  /** Maximum cache size (in MB) */
  maxCacheSize: number;
};
