export async function parseRequestBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type");

  if (!contentType) {
    return {};
  }

  if (contentType.includes("application/json")) {
    try {
      return await request.json();
    } catch {
      throw new Error("Invalid JSON in request body");
    }
  }

  return {};
}