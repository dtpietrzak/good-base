import { getConfig, getDirectories } from "../config/state.ts";
import type { AuthProps } from "./_types.ts";

type DatabaseListProps = AuthProps & {
  verbose?: boolean;
};

export default function databaseList(props: DatabaseListProps) {
  const config = getConfig();
  const directories = getDirectories();

  // Get databases from config
  const databases = config.databases;
  
  // Get database directories
  const databaseDirs = directories.databases;

  // Build the response
  const databaseList = Object.keys(databases).map((dbName) => {
    const dbConfig = databases[dbName];
    const dbDirs = databaseDirs[dbName];

    return {
      name: dbName,
      enabledBackups: dbConfig.enabledBackups,
      maxFileSize: dbConfig.maxFileSize,
      ...(props.verbose === true && { directories: dbDirs }),
      ...(props.verbose === true && { config: dbConfig }),
    };
  });

  return {
    success: true,
    data: {
      databases: databaseList,
      count: databaseList.length,
    },
  };
}