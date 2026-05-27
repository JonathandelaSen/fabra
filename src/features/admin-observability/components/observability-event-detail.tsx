"use client";

import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import type { ProcessingEventResponse } from "@/app/api/admin/processing-events/responses";
import { StatusBadge, Metric } from "./observability-primitives";
import { ObservabilityTimelineItem } from "./observability-timeline-item";

interface ObservabilityEventDetailProps {
  selectedEvent: ProcessingEventResponse;
  timelineEvents: ProcessingEventResponse[];
  copiedId: string | null;
  onCopy: (event: ProcessingEventResponse) => void;
  onCopyTimeline: () => void;
  dateLocale: string;
}

export function ObservabilityEventDetail({
  selectedEvent,
  timelineEvents,
  copiedId,
  onCopy,
  onCopyTimeline,
  dateLocale,
}: ObservabilityEventDetailProps) {
  const t = useTranslations("admin");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/[0.06] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={selectedEvent.status} />
            <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-xs text-zinc-400">
              {selectedEvent.stage}
            </span>
            {selectedEvent.source && (
              <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-xs text-zinc-400">
                {selectedEvent.source}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onCopy(selectedEvent)}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            {copiedId === selectedEvent.id ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                {t("copied")}
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {t("copyJson")}
              </>
            )}
          </button>
        </div>
        <div className="grid gap-3 text-xs text-zinc-500 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            label={t("request")}
            value={selectedEvent.requestId}
          />
          <Metric label={t("cv")} value={selectedEvent.cvId ?? "-"} />
          <Metric
            label={t("analysis")}
            value={selectedEvent.analysisId ?? "-"}
          />
          <Metric
            label={t("duration")}
            value={
              selectedEvent.durationMs === null
                ? "-"
                : `${selectedEvent.durationMs} ms`
            }
          />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1fr_340px]">
        <div className="min-h-0 overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-300">
              {t("attemptTimeline")}
            </h2>
            <button
              type="button"
              onClick={onCopyTimeline}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {copiedId === "timeline" ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  {t("flowCopied")}
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  {t("copyFlow")}
                </>
              )}
            </button>
          </div>
          <ol className="relative space-y-3 border-l border-white/[0.08] pl-4">
            {timelineEvents.map((event) => (
              <ObservabilityTimelineItem
                key={event.id}
                event={event}
                copiedId={copiedId}
                onCopy={onCopy}
                dateLocale={dateLocale}
              />
            ))}
          </ol>
        </div>

        <aside className="min-h-0 overflow-y-auto border-t border-white/[0.06] p-5 lg:border-l lg:border-t-0">
          <h2 className="mb-4 text-sm font-semibold text-zinc-300">
            {t("metadata")}
          </h2>
          <pre className="overflow-x-auto rounded-lg border border-white/[0.06] bg-[#08080d] p-3 text-xs leading-5 text-zinc-400">
            {JSON.stringify(selectedEvent.metadata ?? {}, null, 2)}
          </pre>
        </aside>
      </div>
    </div>
  );
}
