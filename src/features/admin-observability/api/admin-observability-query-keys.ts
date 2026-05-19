import type { ProcessingEventStatus } from "@/app/api/admin/processing-events/responses";

export interface AdminObservabilityFilters {
  status: ProcessingEventStatus | "";
  stage: string;
}

export const adminObservabilityQueryKeys = {
  all: ["admin-observability"] as const,
  processingEvents: (filters: AdminObservabilityFilters) =>
    [
      ...adminObservabilityQueryKeys.all,
      "processing-events",
      filters.status,
      filters.stage,
    ] as const,
};
