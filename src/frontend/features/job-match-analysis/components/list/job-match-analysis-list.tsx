"use client";

import { Briefcase, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import type { JobMatchAnalysisSummary } from "../../api/job-match-analysis-api";
import { JobAnalysesListSkeleton } from "./job-analyses-list-skeleton";
import { JobMatchAnalysisListItem } from "./job-match-analysis-list-item";

interface JobMatchAnalysisListProps {
  analyses: JobMatchAnalysisSummary[];
  selectedId: string | null;
  searchQuery: string;
  onSelect: (id: string) => void;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
}

export default function JobMatchAnalysisList({
  analyses,
  selectedId,
  searchQuery,
  onSelect,
  onSearchChange,
  isLoading = false,
}: JobMatchAnalysisListProps) {
  const t = useTranslations("analysisFlow.lists");

  return (
    <FeatureSidebarPanel
      header={
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
              {t("jobCount", { count: analyses.length })}
            </p>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint" />
            <input
              type="search"
              placeholder={t("searchOffers")}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-field pl-9 pr-3 py-1.5 text-xs text-text-main outline-none placeholder:text-text-faint focus:border-action-border"
            />
          </label>
        </div>
      }
    >
      {isLoading ? (
        <JobAnalysesListSkeleton />
      ) : analyses.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-action-soft">
            <Briefcase className="h-5 w-5 text-action-text" />
          </div>
          <p className="text-sm font-medium text-text-soft">
            {searchQuery ? t("noMatches") : t("jobEmptyTitle")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {analyses.map((analysis) => (
            <JobMatchAnalysisListItem
              key={analysis.id}
              analysis={analysis}
              selected={selectedId === analysis.id}
              onSelect={() => onSelect(analysis.id)}
            />
          ))}
        </div>
      )}
    </FeatureSidebarPanel>
  );
}
