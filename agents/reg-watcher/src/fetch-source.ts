/**
 * Thin wrapper around the platform fetch — kept separate from the pure
 * hashing/diff/proposal logic so those remain unit-testable without network
 * access. In production this is equivalent to what the `fetch` MCP server
 * would retrieve for the same URL.
 */
export async function fetchSourceText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { "User-Agent": "carbon-guard-reg-watcher/0.1" } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return response.text();
}
