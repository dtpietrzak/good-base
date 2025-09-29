export function extractAuthToken(headers: Headers): string | null {
  const authHeader = headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/);
  return match ? match[1] : null;
}