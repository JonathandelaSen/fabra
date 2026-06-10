import type { MetricGroup } from "../constants";

async function parseError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  const message =
    typeof data?.error === "string"
      ? data.error
      : (data?.error?.message ?? fallback);
  return new Error(message);
}

export async function fetchGroupMetrics<T>(
  group: MetricGroup,
  days: number | null,
): Promise<T> {
  const params = new URLSearchParams();
  if (days !== null) params.set("days", String(days));
  const qs = params.size > 0 ? `?${params}` : "";
  const response = await fetch(`/api/admin/metrics/${group}${qs}`);
  if (!response.ok) throw await parseError(response, "Could not load metrics.");
  return (await response.json()) as T;
}
