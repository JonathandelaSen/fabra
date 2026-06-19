"use client";

import { FileSearch, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormattedDate } from "@/frontend/components/shared/formatted-date";
import { FeatureSidebarPanel } from "@/frontend/components/shared/feature-sidebar-panel";
import { CVAnalysesListSkeleton } from "./cv-analyses-list-skeleton";
import type { AnalysisSummary } from "@/lib/analysis-types";
import { featureListItemClassName } from "@/frontend/components/shared/feature-visual-system";

interface CVAnalysesListViewProps {
  analyses: AnalysisSummary[];
  selectedId: string | null;
  searchQuery: string;
  onSelect: (id: string) => void;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
}

const getScoreColor = (score: number | null) => {
  if (score === null) return "";
  if (score >= 80) return "text-score-high-text bg-score-high-soft border-score-high-border";
  if (score >= 60) return "text-score-mid-text bg-score-mid-soft border-score-mid-border";
  return "text-score-low-text bg-score-low-soft border-score-low-border";
};

export default function CVAnalysesListView({
  analyses,
  selectedId,
  searchQuery,
  onSelect,
  onSearchChange,
  isLoading = false,
}: CVAnalysesListViewProps) {
  const t = useTranslations("analysisFlow.lists");
  const common = useTranslations("common");

  return (
    <FeatureSidebarPanel
      header={
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
              {t("cvCount", { count: analyses.length })}
            </p>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint" />
            <input
              type="search"
              placeholder={t("searchAnalyses")}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-field pl-9 pr-3 py-1.5 text-xs text-text-main outline-none placeholder:text-text-faint focus:border-action-border"
            />
          </label>
        </div>
      }
    >
      {isLoading ? (
        <CVAnalysesListSkeleton />
      ) : analyses.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-action-soft">
            <FileSearch className="h-5 w-5 text-action-text" />
          </div>
          <p className="text-sm font-medium text-text-soft">
            {searchQuery ? t("noCvMatches") : t("cvEmptyTitle")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(analysis.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(analysis.id);
                }
              }}
              className={featureListItemClassName(selectedId === analysis.id, "flex items-start gap-3")}
            >
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text-soft transition-colors group-hover:text-action-text">
                    {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
                  </p>
                  {analysis.ai_score !== null ? (
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold ${getScoreColor(analysis.ai_score)}`}
                    >
                      {analysis.ai_score}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-panel-control px-1.5 py-0.5 text-[10px] text-text-muted">
                      {common("states.pending")}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <FormattedDate value={analysis.created_at} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </FeatureSidebarPanel>
  );
}
