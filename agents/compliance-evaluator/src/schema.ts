import { z } from "zod";

export const FindingSchema = z.object({
  category: z.enum([
    "missing_field",
    "period_mismatch",
    "missing_factor_source",
    "unit_error",
    "false_claims_risk",
  ]),
  severity: z.enum(["low", "medium", "high"]),
  message: z.string().min(1),
});

export type Finding = z.infer<typeof FindingSchema>;

export const ReportForEvaluationSchema = z.object({
  report_type: z.enum(["cbam_xml", "cca_estimate", "csrd"]),
  period_start: z.string(),
  period_end: z.string(),
  content: z.record(z.string(), z.unknown()),
});

export type ReportForEvaluation = z.infer<typeof ReportForEvaluationSchema>;
