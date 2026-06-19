export const METRIC_GROUPS = [
  "cv",
  "analysis",
  "opportunities",
  "feedback",
  "workspace",
] as const;

export type MetricGroup = (typeof METRIC_GROUPS)[number];
