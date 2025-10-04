import { STATUS_CODE } from "@std/http/status";
import { createResponse } from "./createResponse.ts";
import { parseRequestBody } from "./parseRequestBody.ts";
import { extractAuthToken } from "./extractAuthToken.ts";
import { handleProcessRequest } from "./handleProcessRequest.ts";
import { processes, ProcessKeys } from "../_constants.ts";
import { z } from "npm:zod";

export async function handleHttpRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return createResponse({ success: true, info: "CORS preflight" });
  }

  // Root endpoint - basic info
  if (url.pathname === "/" || url.pathname === "") {
    return createResponse({
      success: true,
      data: {
        name: "good-base",
        version: "0.0.1",
        description: "A database system with CLI and HTTP API",
        endpoints: {
          "GET  /": "This endpoint - basic system information",
          "GET  /help": "List available commands and their documentation",
          "POST /<command>": "Execute a command via POST request",
        },
      },
      info: "Good-Base API Server",
    });
  }

  // List available commands endpoint
  if (url.pathname === "/help") {
    const _processes = Object.values(processes).filter((process) => {
      return process.on.http;
    }).map((proc) => ({
      endpoint: `/${proc.command}`,
      description: proc.description,
      body: Object.fromEntries(
        Object.entries(proc.args).filter(([key]) => key !== "auth").map(
          (arg) => {
            return [arg[0], {
              ...z.toJSONSchema(arg[1].schema, { target: "openapi-3.0" }),
              description: arg[1].description,
            }];
          },
        ),
      ),
    }));

    return createResponse({
      success: true,
      data: {
        processes: _processes,
        headers: {
          authentication: "Bearer <token>",
        },
      },
      info: "Available commands",
    });
  }

  // Command execution endpoints (POST /<command>)
  if (method === "POST") {
    // Remove leading slash
    const process = url.pathname.slice(1) as ProcessKeys;

    if (!process) {
      return createResponse({
        success: false,
        error: "No command specified in URL path",
      }, STATUS_CODE.BadRequest);
    }

    const processConfig = processes[process];
    if (!processConfig || processConfig.on.http === false) {
      return createResponse({
        success: false,
        error: `Unknown or unsupported command: '${process}'`,
        info: `Use GET /help to list available commands`,
      }, STATUS_CODE.NotFound);
    }

    try {
      const body = await parseRequestBody(request) as Record<string, unknown>;
      const authToken = extractAuthToken(request.headers);

      const result = await handleProcessRequest({
        processKey: process,
        parsedArgs: body as Record<string, string | boolean>,
        authToken: authToken,
      });
      const status = result.success ? STATUS_CODE.OK : STATUS_CODE.BadRequest;

      return createResponse(result, status);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : String(error);
      return createResponse({
        success: false,
        error: errorMessage,
      }, STATUS_CODE.BadRequest);
    }
  }

  // 404 for unknown endpoints
  return createResponse({
    success: false,
    error: "Endpoint not found",
    info: `Available endpoints: GET /, GET /help, POST /<command>`,
  }, STATUS_CODE.NotFound);
}
