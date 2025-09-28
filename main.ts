// Type definitions for database operations
export interface EchoProps {
  readonly text: string;
}

export interface ReadProps {
  readonly index: string;
  readonly key: string;
  readonly value?: string;
  readonly auth: string;
  readonly upsert?: boolean;
}

export interface InsertProps {
  readonly index: string;
  readonly key: string;
  readonly value: string;
  readonly auth: string;
  readonly upsert?: boolean;
}

// Union type for database operations
export type DatabaseOperation = EchoProps | ReadProps | InsertProps;

// Type guards to determine operation type
export function isEchoOperation(op: DatabaseOperation): op is EchoProps {
  return 'text' in op;
}

export function isReadOperation(op: DatabaseOperation): op is ReadProps {
  return 'index' in op && 'key' in op && !('value' in op && op.value !== undefined);
}

export function isInsertOperation(op: DatabaseOperation): op is InsertProps {
  return 'index' in op && 'key' in op && 'value' in op && op.value !== undefined;
}

// Database operation results
export type EchoResult = { text: string };
export type ReadResult = { value: string | null };
export type InsertResult = { success: boolean };

// Main database operation function
export function performDatabaseOperation(operation: DatabaseOperation): EchoResult | ReadResult | InsertResult {
  if (isEchoOperation(operation)) {
    return { text: operation.text };
  } else if (isReadOperation(operation)) {
    // Mock implementation for read operation
    return { value: `Value for ${operation.key} in ${operation.index}` };
  } else if (isInsertOperation(operation)) {
    // Mock implementation for insert operation
    return { success: true };
  } else {
    throw new Error('Invalid operation type');
  }
}

// Legacy add function for backward compatibility
export function add(a: number, b: number): number {
  return a + b;
}

// Example usage and testing (commented out for compatibility)
// Uncomment when running in Deno:
/*
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
  
  // Test the database operations
  const echoOp: EchoProps = { text: "Text to echo back" };
  const readOp: ReadProps = { index: "Index of the item to read", key: "Key of the item to read", auth: "Authentication token" };
  const insertOp: InsertProps = { index: "Index of the item to insert into", key: "Key of the item to insert", value: "Value to insert", auth: "Authentication token" };
  
  console.log("Echo result:", performDatabaseOperation(echoOp));
  console.log("Read result:", performDatabaseOperation(readOp));
  console.log("Insert result:", performDatabaseOperation(insertOp));
}
*/
