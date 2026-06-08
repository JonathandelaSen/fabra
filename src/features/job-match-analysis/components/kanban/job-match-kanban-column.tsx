"use client";

import { useDroppable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import type { WheelEvent } from "react";
import type { JobMatchAnalysisOfferStatus } from "@/app/api/job-match-analyses/responses";
import { cn } from "@/lib/utils";
import type { JobMatchAnalysisSummary } from "../../api/job-match-analysis-api";
import { getJobMatchKanbanStatus } from "./job-match-kanban-utils";

interface JobMatchKanbanColumnProps {
  status: JobMatchAnalysisOfferStatus;
  items: JobMatchAnalysisSummary[];
  children: React.ReactNode;
  activeAnalysis?: JobMatchAnalysisSummary | null;
}

const statusAccent: Record<JobMatchAnalysisOfferStatus, string> = {
  interesting: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  applied: "border-indigo-500/25 bg-indigo-500/10 text-indigo-300",
  interview: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  offer: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  discarded: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

export function jobMatchKanbanDroppableId(status: JobMatchAnalysisOfferStatus) {
  return `status:${status}`;
}

function forwardHorizontalWheel(event: WheelEvent<HTMLDivElement>) {
  const horizontalDelta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.shiftKey
        ? event.deltaY
        : 0;

  if (horizontalDelta === 0) return;

  const horizontalScroller = event.currentTarget.closest(
    "[data-kanban-horizontal-scroll]",
  );
  if (!(horizontalScroller instanceof HTMLElement)) return;

  horizontalScroller.scrollLeft += horizontalDelta;
  event.preventDefault();
  event.stopPropagation();
}

export function JobMatchKanbanColumn({
  status,
  items,
  children,
  activeAnalysis = null,
}: JobMatchKanbanColumnProps) {
  const navigation = useTranslations("navigation");
  const t = useTranslations("analysisFlow.kanban");
  const { setNodeRef, isOver } = useDroppable({
    id: jobMatchKanbanDroppableId(status),
  });
  const isTerminal = status === "rejected" || status === "discarded";

  const isTargetColumn =
    isOver &&
    activeAnalysis &&
    getJobMatchKanbanStatus(activeAnalysis) !== status;

  const placeholderElement = activeAnalysis && (
    <div className="opacity-30 border-dashed border-line bg-panel-base/40 rounded-lg border p-3 select-none pointer-events-none">
      <span className="line-clamp-2 text-sm font-semibold leading-snug text-text-main opacity-50">
        {activeAnalysis.title || activeAnalysis.filename.replace(/\.pdf$/i, "")}
      </span>
      <div className="mt-3 flex items-center justify-between gap-2 opacity-50">
        <span className="rounded-md border px-2 py-0.5 text-xs font-bold border-zinc-700 bg-zinc-800/70 text-zinc-500">
          {activeAnalysis.aiScore ?? "..."}
        </span>
      </div>
    </div>
  );

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[220px] w-full min-w-0 flex-col rounded-lg border border-line bg-panel-base/55 md:h-full md:min-h-0 md:w-[18rem] md:min-w-[18rem]",
        isTerminal && "opacity-80",
        isOver && "border-action-border bg-panel-selected/80",
      )}
      aria-labelledby={`kanban-column-${status}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn("h-2.5 w-2.5 rounded-full border", statusAccent[status])}
            aria-hidden="true"
          />
          <h2
            id={`kanban-column-${status}`}
            className="truncate text-sm font-semibold text-text-main"
          >
            {navigation(`offerStatuses.${status}`)}
          </h2>
        </div>
        <span className="rounded-md border border-line bg-panel-subtle px-1.5 py-0.5 text-xs font-semibold text-text-muted">
          {items.length}
        </span>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-contain p-2.5"
        onWheel={forwardHorizontalWheel}
      >
        {items.length > 0 ? (
          <>
            {children}
            {isTargetColumn && placeholderElement}
          </>
        ) : isTargetColumn ? (
          placeholderElement
        ) : (
          <div className="flex min-h-24 flex-1 items-center justify-center rounded-md border border-dashed border-line text-xs text-text-muted">
            {t("emptyColumn")}
          </div>
        )}
      </div>
    </section>
  );
}
