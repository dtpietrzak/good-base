import { STATUS_CODE } from "@std/http/status";
import { ApiResponse } from "../_types.ts";

export function createResponse(
  data: ApiResponse,
  status: number = STATUS_CODE.OK,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
