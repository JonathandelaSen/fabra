import type { GroupMetricsResponse } from "@/app/api/admin/metrics/responses";
import type { MetricGroup } from "../constants";

async function readJsonResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | ({ error?: string | { message?: string } } & T)
    | null;
  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : (data?.error?.message ?? fallback);
    throw new Error(message);
  }
  return data as T;
}

export async function fetchGroupMetrics(
  group: MetricGroup,
  days: number | null,
): Promise<GroupMetricsResponse> {
  const params = new URLSearchParams();
  if (days !== null) params.set("days", String(days));
  const qs = params.size > 0 ? `?${params}` : "";
  const response = await fetch(`/api/admin/metrics/${group}${qs}`);
  return readJsonResponse<GroupMetricsResponse>(
    response,
    "Could not load metrics.",
  );
}
