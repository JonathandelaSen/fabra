"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import type { JobMatchAnalysisOfferStatus } from "@/app/api/job-match-analyses/responses";
import { cn } from "@/lib/utils";
import type { JobMatchAnalysisSummary } from "../../api/job-match-analysis-api";
import { JobMatchKanbanCard } from "./job-match-kanban-card";
import { JobMatchKanbanColumn, statusAccent } from "./job-match-kanban-column";
import {
  buildJobMatchKanbanColumns,
  getJobMatchKanbanStatus,
  JOB_MATCH_KANBAN_STATUSES,
} from "./job-match-kanban-utils";

interface JobMatchKanbanBoardProps {
  analyses: JobMatchAnalysisSummary[];
  searchQuery: string;
  isLoading?: boolean;
  isMoving?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: JobMatchAnalysisOfferStatus) => void;
}

function parseStatus(id: string): JobMatchAnalysisOfferStatus | null {
  const status = id.replace(/^status:/, "") as JobMatchAnalysisOfferStatus;
  return JOB_MATCH_KANBAN_STATUSES.includes(status) ? status : null;
}

export function JobMatchKanbanBoard({
  analyses,
  searchQuery,
  isLoading = false,
  isMoving = false,
  onSelect,
  onDelete,
  onMove,
}: JobMatchKanbanBoardProps) {
  const t = useTranslations("analysisFlow.kanban");
  const navigation = useTranslations("navigation");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<JobMatchAnalysisOfferStatus | null>(null);
  const [pendingMoves, setPendingMoves] = useState<Record<string, JobMatchAnalysisOfferStatus>>({});
  const [activeTab, setActiveTab] = useState<JobMatchAnalysisOfferStatus>("interesting");

  // Sync / clear pending moves that have completed in the backend
  useEffect(() => {
    setPendingMoves((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const [id, targetStatus] of Object.entries(next)) {
        const item = analyses.find((a) => a.id === id);
        if (!item || getJobMatchKanbanStatus(item) === targetStatus) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [analyses]);

  const columns = useMemo(() => {
    // 1. Build original columns from props
    const cols = buildJobMatchKanbanColumns(analyses);

    // 2. Apply any pending moves to columns so the card stays in the target column during network transit
    for (const [id, targetStatus] of Object.entries(pendingMoves)) {
      let foundItem: JobMatchAnalysisSummary | null = null;
      for (const status of JOB_MATCH_KANBAN_STATUSES) {
        const idx = cols[status].findIndex((a) => a.id === id);
        if (idx !== -1) {
          foundItem = cols[status][idx];
          cols[status] = cols[status].filter((a) => a.id !== id);
          break;
        }
      }
      if (foundItem) {
        cols[targetStatus] = [...cols[targetStatus], { ...foundItem, offerStatus: targetStatus }];
      }
    }

    return cols;
  }, [analyses, pendingMoves]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    const currentStatus = event.active.data.current?.status as
      | JobMatchAnalysisOfferStatus
      | undefined;
    if (currentStatus) {
      setOverStatus(currentStatus);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      const status = parseStatus(String(event.over.id));
      setOverStatus(status);
    } else {
      setOverStatus(null);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverStatus(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setOverStatus(null);
    if (!event.over) return;
    const status = parseStatus(String(event.over.id));
    if (!status) return;
    const currentStatus = event.active.data.current?.status as
      | JobMatchAnalysisOfferStatus
      | undefined;
    if (currentStatus === status) return;
    
    // Register the pending move to target column instantly
    setPendingMoves((prev) => ({ ...prev, [event.active.id]: status }));
    onMove(String(event.active.id), status);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-muted">
        {t("loading")}
      </div>
    );
  }

  const total = Object.values(columns).reduce(
    (count, items) => count + items.length,
    0,
  );

  if (total === 0) {
    return (
      <div className="flex w-full flex-1 h-full items-center justify-center rounded-lg border border-line bg-panel-base/60 p-8 text-center">
        <div>
          <p className="text-sm font-semibold text-text-main">
            {searchQuery ? t("noMatches") : t("emptyBoardTitle")}
          </p>
          {!searchQuery && (
            <p className="mt-1 text-sm text-text-muted">
              {t("emptyBoardDescription")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full min-h-0 w-full md:w-max flex-col">
        {isMoving && (
          <div className="mb-2 text-xs font-medium text-text-muted">
            {t("saving")}
          </div>
        )}

        {/* Mobile Status Tabs Selector */}
        <div className="md:hidden w-full mb-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <div className="flex gap-1.5 min-w-max px-1">
            {JOB_MATCH_KANBAN_STATUSES.map((status) => {
              const count = columns[status].length;
              const isActive = activeTab === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveTab(status)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-200",
                    isActive
                      ? "bg-action/15 border-action-border/35 text-action-text"
                      : "bg-panel-base/60 border-line text-text-muted hover:text-text-on-bright"
                  )}
                >
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full border", statusAccent[status])}
                    aria-hidden="true"
                  />
                  <span>{navigation(`offerStatuses.${status}`)}</span>
                  <span className="rounded bg-panel-subtle/80 px-1.5 py-0.2 text-[10px] text-text-muted">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 w-full flex-col gap-3 overflow-hidden md:w-max md:flex-row md:overflow-visible md:pb-2">
          {JOB_MATCH_KANBAN_STATUSES.map((status) => {
            const isColumnVisible = activeTab === status;
            return (
              <div
                key={status}
                className={cn(
                  "h-full w-full min-h-0 md:h-full md:w-auto",
                  isColumnVisible ? "block" : "hidden md:block"
                )}
              >
                <JobMatchKanbanColumn
                  status={status}
                  items={columns[status]}
                  activeAnalysis={activeId ? analyses.find((a) => a.id === activeId) : null}
                >
                  {columns[status].map((analysis) => (
                    <JobMatchKanbanCard
                      key={analysis.id}
                      analysis={analysis}
                      onSelect={onSelect}
                      onDelete={onDelete}
                      onMove={onMove}
                    />
                  ))}
                </JobMatchKanbanColumn>
              </div>
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <JobMatchKanbanCard
            analysis={analyses.find((a) => a.id === activeId)!}
            onSelect={onSelect}
            onDelete={onDelete}
            onMove={onMove}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
