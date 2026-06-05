"use client";

import { Columns3, List } from "lucide-react";
import { DeleteButton } from "@/components/shared/action-buttons";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { Button } from "@/components/ui/button";
import type { JobMatchAnalysisRouteView } from "../hooks/use-job-match-analysis-route-state";

interface JobMatchAnalysisHeaderActionsProps {
  view: JobMatchAnalysisRouteView;
  analysisId: string | null;
  listLabel: string;
  boardLabel: string;
  newOfferLabel: string;
  deleteOfferLabel: string;
  isDeleting: boolean;
  onListView: () => void;
  onBoardView: () => void;
  onNewOffer: () => void;
  onDelete: () => void;
}

export function JobMatchAnalysisHeaderActions({
  view,
  analysisId,
  listLabel,
  boardLabel,
  newOfferLabel,
  deleteOfferLabel,
  isDeleting,
  onListView,
  onBoardView,
  onNewOffer,
  onDelete,
}: JobMatchAnalysisHeaderActionsProps) {
  return (
    <>
      <div className="flex items-center rounded-lg border border-line bg-panel-subtle p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onListView}
          aria-pressed={view === "list"}
          className={`transition-all duration-200 ${
            view === "list"
              ? "bg-panel-base text-text-main shadow-xs border border-line/40 font-semibold"
              : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
          }`}
        >
          <List className={`h-4 w-4 transition-colors ${view === "list" ? "text-action" : "text-text-soft"}`} />
          {listLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBoardView}
          aria-pressed={view === "kanban"}
          className={`transition-all duration-200 ${
            view === "kanban"
              ? "bg-panel-base text-text-main shadow-xs border border-line/40 font-semibold"
              : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
          }`}
        >
          <Columns3 className={`h-4 w-4 transition-colors ${view === "kanban" ? "text-action" : "text-text-soft"}`} />
          {boardLabel}
        </Button>
      </div>
      <FeatureHeaderActionButton label={newOfferLabel} onClick={onNewOffer} />
      {analysisId && (
        <DeleteButton
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={deleteOfferLabel}
        />
      )}
    </>
  );
}
