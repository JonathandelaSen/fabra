export interface MetricsWindowRequest {
  days: number | null;
}

export function parseMetricsWindowRequest(params: URLSearchParams):
  | { ok: true; value: MetricsWindowRequest }
  | { ok: false; error: { message: string; status: number } } {
  const raw = params.get("days");
  if (raw === null) return { ok: true, value: { days: null } };

  const days = Number(raw);
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    return {
      ok: false,
      error: { message: "days must be an integer between 1 and 365", status: 400 },
    };
  }
  return { ok: true, value: { days } };
}
