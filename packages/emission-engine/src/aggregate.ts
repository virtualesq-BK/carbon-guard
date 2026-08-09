export type EmissionScope = "scope1" | "scope2" | "scope3";

export interface ScopedEmission {
  scope: EmissionScope;
  emissionValue: number;
}

export function sumEmissions(records: { emissionValue: number }[]): number {
  return records.reduce((sum, r) => sum + r.emissionValue, 0);
}

export function sumEmissionsByScope(
  records: ScopedEmission[]
): Record<EmissionScope, number> {
  const totals: Record<EmissionScope, number> = { scope1: 0, scope2: 0, scope3: 0 };
  for (const r of records) {
    totals[r.scope] += r.emissionValue;
  }
  return totals;
}
