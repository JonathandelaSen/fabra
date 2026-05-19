"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ProcessingEventStatus } from "@/app/api/admin/processing-events/responses";

const STATUS_VALUES = new Set(["started", "success", "warning", "error"]);

function normalizeStatus(value: string | null): ProcessingEventStatus | "" {
  return STATUS_VALUES.has(value ?? "") ? (value as ProcessingEventStatus) : "";
}

export function useAdminObservabilityRouteState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = normalizeStatus(searchParams.get("status"));
  const stage = searchParams.get("stage") ?? "";

  const updateFilters = (next: {
    status?: ProcessingEventStatus | "";
    stage?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextStatus = next.status ?? status;
    const nextStage = next.stage ?? stage;

    if (nextStatus) params.set("status", nextStatus);
    else params.delete("status");

    if (nextStage) params.set("stage", nextStage);
    else params.delete("stage");

    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  return {
    filters: { status, stage },
    setStatus: (nextStatus: ProcessingEventStatus | "") =>
      updateFilters({ status: nextStatus }),
    setStage: (nextStage: string) => updateFilters({ stage: nextStage }),
  };
}
