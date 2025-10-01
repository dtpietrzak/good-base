import { isAbsolute, join, resolve } from "@std/path";

export function path(path: string, ...parts: string[]) {
  const joinedPath = join(path, ...parts);
  return isAbsolute(joinedPath) ? joinedPath : resolve("./" + joinedPath);
}
