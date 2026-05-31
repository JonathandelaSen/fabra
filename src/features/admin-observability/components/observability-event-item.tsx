"use client";

import { useTranslations } from "next-intl";
import type { ProcessingEventResponse } from "@/app/api/admin/processing-events/responses";
import { StatusBadge, formatTime } from "./observability-primitives";

interface ObservabilityEventItemProps {
  event: ProcessingEventResponse;
  isSelected: boolean;
  onClick: () => void;
  dateLocale: string;
}

export function ObservabilityEventItem({
  event,
  isSelected,
  onClick,
  dateLocale,
}: ObservabilityEventItemProps) {
  const t = useTranslations("admin");

  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-2 w-full rounded-lg border p-3 text-left transition ${
        isSelected
          ? "border-indigo-500/40 bg-indigo-500/10"
          : "border-line bg-panel-elevated hover:bg-panel-hover"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <StatusBadge status={event.status} />
        <span className="shrink-0 text-[11px] text-text-muted">
          {formatTime(event.createdAt, dateLocale)}
        </span>
      </div>
      <p className="truncate text-sm font-medium text-text-main">
        {event.stage}
      </p>
      <p className="mt-1 truncate text-xs text-zinc-500">
        {event.source || t("noSource")} · {event.requestId}
      </p>
      {event.errorCode && (
        <p className="mt-2 truncate text-xs text-rose-300">
          {event.errorCode}
        </p>
      )}
    </button>
  );
}
