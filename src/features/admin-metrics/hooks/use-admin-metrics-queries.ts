import { useQuery } from "@tanstack/react-query";
import { adminMetricsQueryKeys } from "../api/admin-metrics-query-keys";
import type { MetricGroup } from "../constants";
import { fetchGroupMetrics } from "../api/admin-metrics-api";

export function useGroupMetrics<T>(group: MetricGroup, days: number | null) {
  const totalQuery = useQuery({
    queryKey: adminMetricsQueryKeys.group(group, null),
    queryFn: () => fetchGroupMetrics<T>(group, null),
  });
  
  const windowQuery = useQuery({
    queryKey: adminMetricsQueryKeys.group(group, days),
    queryFn: () => fetchGroupMetrics<T>(group, days),
    enabled: days !== null,
  });
  
  return { totalQuery, windowQuery };
}
