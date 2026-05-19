"use client";

import { useQuery } from "@tanstack/react-query";
import { listProcessingEvents } from "../api/admin-observability-api";
import {
  adminObservabilityQueryKeys,
  type AdminObservabilityFilters,
} from "../api/admin-observability-query-keys";

export function useProcessingEventsQuery(filters: AdminObservabilityFilters) {
  return useQuery({
    queryKey: adminObservabilityQueryKeys.processingEvents(filters),
    queryFn: () => listProcessingEvents(filters),
  });
}
