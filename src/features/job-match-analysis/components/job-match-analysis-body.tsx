"use client";

import type { ReactNode } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { Button } from "@/components/ui/button";
import type { OfferStatus } from "@/lib/analysis-types";
import type { JobMatchAnalysisSummary } from "../api/job-match-analysis-api";
import type { JobMatchAnalysisRouteMode, JobMatchAnalysisRouteView } from "../hooks/use-job-match-analysis-route-state";
import JobMatchAnalysisList from "./job-match-analysis-list";
import { JobMatchKanbanBoard } from "./job-match-kanban-board";

interface JobMatchAnalysisBodyProps {
  mode: JobMatchAnalysisRouteMode;
  view: JobMatchAnalysisRouteView;
  analysisId: string | null;
  newFlow: ReactNode;
  detailContent: ReactNode;
  analyses: JobMatchAnalysisSummary[];
  selectedId: string | null;
  searchQuery: string;
  searchPlaceholder: string;
  backToBoardLabel: string;
  isListLoading: boolean;
  isMoving: boolean;
  onSearchChange: (query: string) => void;
  onSelect: (id: string) => void;
  onDeleteFromKanban: (id: string) => void;
  onMoveCard: (id: string, status: NonNullable<OfferStatus>) => void;
  onBackToBoard: () => void;
}

export function JobMatchAnalysisBody({
  mode,
  view,
  analysisId,
  newFlow,
  detailContent,
  analyses,
  selectedId,
  searchQuery,
  searchPlaceholder,
  backToBoardLabel,
  isListLoading,
  isMoving,
  onSearchChange,
  onSelect,
  onDeleteFromKanban,
  onMoveCard,
  onBackToBoard,
}: JobMatchAnalysisBodyProps) {
  if (mode === "new") return newFlow;

  if (view === "kanban" && !analysisId) {
    return (
      <div
        data-kanban-horizontal-scroll
        className="h-full min-h-0 overflow-x-auto overflow-y-hidden"
      >
        <div className="flex h-full min-h-0 w-full min-w-full md:w-max md:min-w-full flex-col gap-3">
          <label className="relative block w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-indigo-500/40"
            />
          </label>
          <JobMatchKanbanBoard
            analyses={analyses}
            searchQuery={searchQuery}
            isLoading={isListLoading}
            isMoving={isMoving}
            onSelect={onSelect}
            onDelete={onDeleteFromKanban}
            onMove={onMoveCard}
          />
        </div>
      </div>
    );
  }

  if (view === "kanban") {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-line pb-3">
          <Button type="button" variant="ghost" size="sm" onClick={onBackToBoard}>
            <ArrowLeft className="h-4 w-4" />
            {backToBoardLabel}
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {detailContent}
        </div>
      </div>
    );
  }

  return (
    <FeatureTwoPaneLayout
      sidebar={
        <JobMatchAnalysisList
          analyses={analyses}
          selectedId={selectedId}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSelect={onSelect}
          isLoading={isListLoading}
        />
      }
      mainClassName="overflow-hidden"
    >
      {detailContent}
    </FeatureTwoPaneLayout>
  );
}
