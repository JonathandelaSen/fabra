import { useQuery } from "@tanstack/react-query";
import { adminMetricsQueryKeys } from "../api/admin-metrics-query-keys";
import type { MetricGroup } from "../constants";
import { fetchGroupMetrics } from "../api/admin-metrics-api";

export function useGroupMetrics(group: MetricGroup, days: number | null) {
  const totalQuery = useQuery({
    queryKey: adminMetricsQueryKeys.group(group, null),
    queryFn: () => fetchGroupMetrics(group, null),
  });

  const windowQuery = useQuery({
    queryKey: adminMetricsQueryKeys.group(group, days),
    queryFn: () => fetchGroupMetrics(group, days),
    enabled: days !== null,
  });

  return { totalQuery, windowQuery };
}
