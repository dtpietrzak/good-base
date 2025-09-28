import { assertEquals, assertThrows } from "@std/assert";
import { 
  add, 
  performDatabaseOperation, 
  isEchoOperation, 
  isReadOperation, 
  isInsertOperation,
  type EchoProps,
  type ReadProps,
  type InsertProps
} from "./main.ts";

// Test the legacy add function
Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});

// Test type guards
Deno.test(function typeGuardTests() {
  const echoOp: EchoProps = { text: "hello" };
  const readOp: ReadProps = { index: "idx", key: "key", auth: "token" };
  const insertOp: InsertProps = { index: "idx", key: "key", value: "val", auth: "token" };

  assertEquals(isEchoOperation(echoOp), true);
  assertEquals(isEchoOperation(readOp), false);
  assertEquals(isEchoOperation(insertOp), false);

  assertEquals(isReadOperation(echoOp), false);
  assertEquals(isReadOperation(readOp), true);
  assertEquals(isReadOperation(insertOp), false);

  assertEquals(isInsertOperation(echoOp), false);
  assertEquals(isInsertOperation(readOp), false);
  assertEquals(isInsertOperation(insertOp), true);
});

// Test echo operation
Deno.test(function echoOperationTest() {
  const echoOp: EchoProps = { text: "Text to echo back" };
  const result = performDatabaseOperation(echoOp);
  assertEquals(result, { text: "Text to echo back" });
});

// Test read operation
Deno.test(function readOperationTest() {
  const readOp: ReadProps = { 
    index: "Index of the item to read", 
    key: "Key of the item to read", 
    auth: "Authentication token" 
  };
  const result = performDatabaseOperation(readOp);
  assertEquals(result, { value: "Value for Key of the item to read in Index of the item to read" });
});

// Test insert operation
Deno.test(function insertOperationTest() {
  const insertOp: InsertProps = { 
    index: "Index of the item to insert into", 
    key: "Key of the item to insert", 
    value: "Value to insert", 
    auth: "Authentication token" 
  };
  const result = performDatabaseOperation(insertOp);
  assertEquals(result, { success: true });
});

// Test that the original type error scenario now works
Deno.test(function typeErrorResolutionTest() {
  // This was the problematic case from the error message
  const echoOnly: EchoProps = { text: "Text to echo back" };
  
  // This should now work without type errors
  const result = performDatabaseOperation(echoOnly);
  assertEquals(result, { text: "Text to echo back" });
});

// Test operations with optional properties
Deno.test(function optionalPropertiesTest() {
  const readWithUpsert: ReadProps = { 
    index: "idx", 
    key: "key", 
    auth: "token",
    upsert: true
  };
  
  const insertWithUpsert: InsertProps = { 
    index: "idx", 
    key: "key", 
    value: "val", 
    auth: "token",
    upsert: false
  };
  
  assertEquals(isReadOperation(readWithUpsert), true);
  assertEquals(isInsertOperation(insertWithUpsert), true);
});
