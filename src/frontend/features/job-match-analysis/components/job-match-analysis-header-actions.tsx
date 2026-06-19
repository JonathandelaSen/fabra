"use client";

import { Columns3, FileDown, List } from "lucide-react";
import { DeleteButton } from "@/frontend/components/shared/action-buttons";
import { FeatureHeaderActionButton } from "@/frontend/components/shared/feature-header-action-button";
import { Button } from "@/frontend/components/ui/button";
import type { JobMatchAnalysisRouteView } from "../hooks/use-job-match-analysis-route-state";
import { JOB_MATCH_ROUTE_VIEWS } from "../constants";

interface JobMatchAnalysisHeaderActionsProps {
  view: JobMatchAnalysisRouteView;
  analysisId: string | null;
  listLabel: string;
  boardLabel: string;
  newOfferLabel: string;
  deleteOfferLabel: string;
  exportLabel: string;
  isDeleting: boolean;
  onExport?: () => void;
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
  exportLabel,
  isDeleting,
  onExport,
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
          aria-pressed={view === JOB_MATCH_ROUTE_VIEWS.list}
          className={`transition-all duration-200 ${
            view === JOB_MATCH_ROUTE_VIEWS.list
              ? "bg-panel-base text-text-on-bright shadow-xs border border-line/40 font-semibold"
              : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
          }`}
        >
          <List className={`h-4 w-4 transition-colors ${view === JOB_MATCH_ROUTE_VIEWS.list ? "text-action" : "text-text-soft"}`} />
          {listLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBoardView}
          aria-pressed={view === JOB_MATCH_ROUTE_VIEWS.kanban}
          className={`transition-all duration-200 ${
            view === JOB_MATCH_ROUTE_VIEWS.kanban
              ? "bg-panel-base text-text-on-bright shadow-xs border border-line/40 font-semibold"
              : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
          }`}
        >
          <Columns3 className={`h-4 w-4 transition-colors ${view === JOB_MATCH_ROUTE_VIEWS.kanban ? "text-action" : "text-text-soft"}`} />
          {boardLabel}
        </Button>
      </div>
      <FeatureHeaderActionButton label={newOfferLabel} onClick={onNewOffer} />
      {onExport && (
        <Button type="button" variant="outline" onClick={onExport}>
          <FileDown className="h-4 w-4" />
          {exportLabel}
        </Button>
      )}
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
