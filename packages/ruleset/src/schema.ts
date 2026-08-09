import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다");

// A confirmed factor has a numeric value and a non-empty source.
// An unconfirmed factor MUST use the literal "TODO" — never a guessed number.
// See root CLAUDE.md 금지 행동 ①.
export const FactorFileSchema = z
  .object({
    factor_key: z.string().min(1),
    version: z.string().min(1),
    value: z.union([z.number(), z.literal("TODO")]),
    unit: z.string().min(1),
    source: z.string(),
    effective_from: isoDate,
    effective_to: isoDate.nullable(),
    notes: z.string().optional(),
  })
  .refine((f) => f.value === "TODO" || f.source.trim().length > 0, {
    message:
      "source must be non-empty when value is a confirmed number (root CLAUDE.md 금지 행동 ①)",
    path: ["source"],
  });

export type FactorFile = z.infer<typeof FactorFileSchema>;

export const RegulationFileSchema = z
  .object({
    regulation_key: z.string().min(1),
    jurisdiction: z.string().min(1),
    version: z.string().min(1),
    effective_from: z.string().min(1), // may itself be "TODO" pending confirmation
    source_url: z.string(),
    status: z.enum(["draft", "approved"]),
  })
  .passthrough() // regulations carry heterogeneous extra fields (covered_sectors, tax_model, ...)
  .refine((r) => r.status !== "approved" || r.source_url.trim().length > 0, {
    message: "approved regulations must have a non-empty source_url",
    path: ["source_url"],
  });

export type RegulationFile = z.infer<typeof RegulationFileSchema>;
