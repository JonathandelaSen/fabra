"use client";

import { CalendarClock, ExternalLink, GripVertical, MoreHorizontal, Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import type { JobMatchAnalysisOfferStatus } from "@/app/api/job-match-analyses/responses";
import { FormattedDate } from "@/components/shared/formatted-date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { JobMatchAnalysisSummary } from "../api/job-match-analysis-api";
import {
  getJobMatchKanbanStatus,
  JOB_MATCH_KANBAN_STATUSES,
} from "./job-match-kanban-utils";

interface JobMatchKanbanCardProps {
  analysis: JobMatchAnalysisSummary;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: JobMatchAnalysisOfferStatus) => void;
}

function scoreClassName(score: number | null) {
  if (score === null) return "border-zinc-700 bg-zinc-800/70 text-zinc-500";
  if (score >= 80) return "border-emerald-500/20 bg-emerald-500/15 text-emerald-300";
  if (score >= 60) return "border-amber-500/20 bg-amber-500/15 text-amber-300";
  return "border-rose-500/20 bg-rose-500/15 text-rose-300";
}

export function JobMatchKanbanCard({
  analysis,
  onSelect,
  onDelete,
  onMove,
}: JobMatchKanbanCardProps) {
  const t = useTranslations("analysisFlow.kanban");
  const common = useTranslations("common");
  const navigation = useTranslations("navigation");
  const status = getJobMatchKanbanStatus(analysis);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: analysis.id,
      data: { status },
    });
  const title = analysis.title || analysis.filename.replace(/\.pdf$/i, "");
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border border-line bg-panel-raised p-3 shadow-sm transition-colors hover:border-action-border/60 hover:bg-panel-hover",
        isDragging && "relative z-20 opacity-70 shadow-xl",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-text-muted hover:bg-panel-active hover:text-text-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-border active:cursor-grabbing"
          aria-label={t("dragCard", { title })}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelect(analysis.id)}
          className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-border"
        >
          <span className="line-clamp-2 text-sm font-semibold leading-snug text-text-main">
            {title}
          </span>
          <span className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <FormattedDate value={analysis.createdAt} />
            {analysis.jobUrl && <ExternalLink className="h-3 w-3" aria-hidden="true" />}
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-muted hover:text-text-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-border"
            aria-label={t("cardActions", { title })}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {JOB_MATCH_KANBAN_STATUSES.map((nextStatus) => (
              <DropdownMenuItem
                key={nextStatus}
                onClick={() => onMove(analysis.id, nextStatus)}
                disabled={nextStatus === status}
              >
                {navigation(`offerStatuses.${nextStatus}`)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(analysis.id)}
            >
              <Trash2 className="h-4 w-4" />
              {t("deleteCard")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 text-xs font-bold",
            scoreClassName(analysis.aiScore),
          )}
        >
          {analysis.aiScore ?? common("states.pending")}
        </span>
        {analysis.offerNextActionAt && (
          <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-text-muted">
            <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <FormattedDate value={analysis.offerNextActionAt} />
          </span>
        )}
      </div>
    </article>
  );
}
