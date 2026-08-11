export type RiskLevel = "low" | "medium" | "high";

export function getRiskLevel(risk: number): RiskLevel {
  if (risk > 70) return "high";
  if (risk >= 30) return "medium";
  return "low";
}

export function getRiskIndicatorClass(level: RiskLevel) {
  if (level === "high") return "bg-danger";
  if (level === "medium") return "bg-gold";
  return "bg-success";
}
