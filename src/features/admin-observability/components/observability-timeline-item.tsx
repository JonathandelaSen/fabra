"use client";

import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import type { ProcessingEventResponse } from "@/app/api/admin/processing-events/responses";
import { StatusBadge, formatDateTime, formatBytes } from "./observability-primitives";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import { BasicPanel } from "@/components/shared/basic-panel";

interface ObservabilityTimelineItemProps {
  event: ProcessingEventResponse;
  copiedId: string | null;
  onCopy: (event: ProcessingEventResponse) => void;
  dateLocale: string;
}

export function ObservabilityTimelineItem({
  event,
  copiedId,
  onCopy,
  dateLocale,
}: ObservabilityTimelineItemProps) {
  const t = useTranslations("admin");

  return (
    <li className="relative">
      <span
        className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border ${
          event.status === "error"
            ? "border-rose-300 bg-rose-500"
            : event.status === "warning"
              ? "border-amber-300 bg-amber-500"
              : event.status === "success"
                ? "border-emerald-300 bg-emerald-500"
                : "border-sky-300 bg-sky-500"
        }`}
      />
      <BasicPanel className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-100">
              {event.stage}
              {event.source ? ` · ${event.source}` : ""}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {formatDateTime(event.createdAt, dateLocale)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onCopy(event)}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              title={t("copyEventJson")}
            >
              {copiedId === event.id ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
            <StatusBadge status={event.status} />
          </div>
        </div>
        <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-3">
          <span>
            {t("text")}: {event.textLength ?? "-"}
          </span>
          <span>
            {t("file")}: {formatBytes(event.fileSize)}
          </span>
          <span>
            {event.durationMs === null
              ? `${t("duration")}: -`
              : `${t("duration")}: ${event.durationMs} ms`}
          </span>
        </div>
        {(event.errorCode || event.errorMessage) && (
          <AlertBanner
            tone={ALERT_BANNER_TONES.DANGER}
            title={event.errorCode ?? t("errorFallback")}
            className="mt-3"
          >
            {event.errorMessage && (
              <p>{event.errorMessage}</p>
            )}
          </AlertBanner>
        )}
      </BasicPanel>
    </li>
  );
}
