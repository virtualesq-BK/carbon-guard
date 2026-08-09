import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const SOURCES_FILE = join(__dirname, "..", "sources.yaml");

export const SourceSchema = z.object({
  key: z.string().min(1), // maps to a ruleset factor_key or regulation_key
  kind: z.enum(["factor", "regulation"]),
  url: z.string().url(),
  description: z.string().min(1),
  verified: z.boolean(),
});

export type Source = z.infer<typeof SourceSchema>;

export const SourcesFileSchema = z.object({ sources: z.array(SourceSchema) });

export function loadSources(filePath: string = SOURCES_FILE): Source[] {
  const raw = parseYaml(readFileSync(filePath, "utf-8"));
  const parsed = SourcesFileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid sources.yaml: ${parsed.error.message}`);
  }
  return parsed.data.sources;
}

/** Only human-verified sources are ever actually fetched — see sources.yaml header. */
export function verifiedSourcesOnly(sources: Source[]): Source[] {
  return sources.filter((s) => s.verified);
}

/**
 * sources.yaml allows multiple URLs to point at the same ruleset key (e.g. two
 * different official pages both tracking "cbam"), so state must be tracked
 * per (key, url) pair, not per key alone.
 */
export function sourceId(source: Source): string {
  const urlSlug = source.url.replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 60);
  return `${source.kind}__${source.key.replace(/\//g, "_")}__${urlSlug}`;
}
