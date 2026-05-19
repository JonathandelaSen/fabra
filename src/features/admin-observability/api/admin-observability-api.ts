import type { ListProcessingEventsResponse } from "@/app/api/admin/processing-events/responses";
import type { AdminObservabilityFilters } from "./admin-observability-query-keys";

export async function listProcessingEvents(
  filters: AdminObservabilityFilters,
): Promise<ListProcessingEventsResponse> {
  const params = new URLSearchParams({ limit: "150" });
  if (filters.status) params.set("status", filters.status);
  if (filters.stage) params.set("stage", filters.stage);

  const response = await fetch(`/api/admin/processing-events?${params}`);
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : data.error?.message ?? "Could not load events.";
    throw new Error(message);
  }

  return data as ListProcessingEventsResponse;
}
