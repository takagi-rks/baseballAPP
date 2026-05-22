export function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Walks a path (e.g. ['scores', 'us']) inside a response object safely.
 * Returns an empty array if any part of the path is missing or not an array.
 */
export function normalizeResponse<T>(resp: unknown, path: string[]): T[] {
  let cur: any = resp;
  for (const p of path) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = cur[p];
    } else {
      return [];
    }
  }
  return safeArray<T>(cur);
}
