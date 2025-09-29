import type { AuthProps } from "../_types.ts";

type DatabaseListProps = AuthProps & {
  verbose?: string;
};

export default function databaseList(props: DatabaseListProps) {
  console.log("Running database-list: " + JSON.stringify(props));
  
  // TODO: Implement database listing logic
  // - Scan the data directory for existing databases
  // - Read metadata for each database (creation date, description, size, etc.)
  // - Format output (simple list vs verbose with details)
  // - Handle cases where data directory doesn't exist
  // - Show database status (active, corrupted, etc.)
  
  return { success: true, data: props };
}