"use client";

import { useMemo, useState } from "react";
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
import type { JobMatchAnalysisSummary } from "../api/job-match-analysis-api";
import { JobMatchKanbanCard } from "./job-match-kanban-card";
import { JobMatchKanbanColumn } from "./job-match-kanban-column";
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

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<JobMatchAnalysisOfferStatus | null>(null);

  const columns = useMemo(() => {
    const cols = buildJobMatchKanbanColumns(analyses);
    if (!activeId || !overStatus) return cols;

    const item = analyses.find((a) => a.id === activeId);
    if (!item) return cols;

    const currentStatus = getJobMatchKanbanStatus(item);
    if (currentStatus === overStatus) return cols;

    // Temporarily move the card in local view memory during drag to act as a placeholder
    cols[currentStatus] = cols[currentStatus].filter((a) => a.id !== activeId);
    if (!cols[overStatus].some((a) => a.id === activeId)) {
      cols[overStatus] = [...cols[overStatus], item];
    }
    return cols;
  }, [analyses, activeId, overStatus]);

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
      <div className="flex h-full items-center justify-center rounded-lg border border-line bg-panel-base/60 p-8 text-center">
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
      <div className="flex h-full min-h-0 w-max flex-col">
        {isMoving && (
          <div className="mb-2 text-xs font-medium text-text-muted">
            {t("saving")}
          </div>
        )}
        <div className="flex min-h-0 flex-1 w-max flex-col gap-3 overflow-y-auto md:flex-row md:overflow-visible md:pb-2">
          {JOB_MATCH_KANBAN_STATUSES.map((status) => (
            <JobMatchKanbanColumn
              key={status}
              status={status}
              items={columns[status]}
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
          ))}
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
