export interface EmissionRecordInput {
  id: string;
  factor_ref: string;
  scope: "scope1" | "scope2" | "scope3";
  emission_value: number;
  period_start: string;
  period_end: string;
}

/** Shape of a row inserted into the `reports` table — always starts as a draft. */
export interface ReportInsert {
  company_id: string;
  report_type: "cbam_xml" | "cca_estimate" | "csrd";
  period_start: string;
  period_end: string;
  generated_by: "compliance-generator";
  content: Record<string, unknown>;
  status: "draft";
}
