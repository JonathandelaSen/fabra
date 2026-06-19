import type { MetricGroup } from "../constants";

export const adminMetricsQueryKeys = {
  group: (group: MetricGroup, days: number | null) =>
    ["admin-metrics", group, days] as const,
};
