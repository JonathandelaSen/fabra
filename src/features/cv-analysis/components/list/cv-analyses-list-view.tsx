"use client";

import { FileSearch, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormattedDate } from "@/components/shared/formatted-date";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { IconBox, ICON_BOX_TONES } from "@/components/shared/icon-box";
import { CVAnalysesListSkeleton } from "./cv-analyses-list-skeleton";
import type { AnalysisSummary } from "@/lib/analysis-types";
import { featureListItemClassName } from "@/components/shared/feature-visual-system";
import { cn } from "@/lib/utils";

interface CVAnalysesListViewProps {
  analyses: AnalysisSummary[];
  selectedId: string | null;
  searchQuery: string;
  onSelect: (id: string) => void;
  onSearchChange: (value: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const getScoreColor = (score: number | null) => {
  if (score === null) return "";
  if (score >= 80) return "text-emerald-400 bg-emerald-500/15 border-emerald-500/20";
  if (score >= 60) return "text-amber-400 bg-amber-500/15 border-amber-500/20";
  return "text-rose-400 bg-rose-500/15 border-rose-500/20";
};

export default function CVAnalysesListView({
  analyses,
  selectedId,
  searchQuery,
  onSelect,
  onSearchChange,
  onDelete,
  isLoading = false,
}: CVAnalysesListViewProps) {
  const t = useTranslations("analysisFlow.lists");
  const common = useTranslations("common");

  return (
    <FeatureSidebarPanel
      header={
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
              {t("cvCount", { count: analyses.length })}
            </p>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="search"
              placeholder={t("searchAnalyses")}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-3 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-indigo-500/40"
            />
          </label>
        </div>
      }
    >
      {isLoading ? (
        <CVAnalysesListSkeleton />
      ) : analyses.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10">
            <FileSearch className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-zinc-400">
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
              <IconBox
                icon={FileSearch}
                tone={
                  selectedId === analysis.id
                    ? ICON_BOX_TONES.ACTION
                    : ICON_BOX_TONES.NEUTRAL
                }
              />

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-action-text">
                    {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
                  </p>
                  {analysis.ai_score !== null ? (
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold ${getScoreColor(analysis.ai_score)}`}
                    >
                      {analysis.ai_score}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-zinc-800/70 px-1.5 py-0.5 text-[10px] text-zinc-500">
                      {common("states.pending")}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <FormattedDate value={analysis.created_at} />
                </div>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(analysis.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onDelete(analysis.id);
                  }
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-600 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                aria-label={t("deleteAnalysis")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </FeatureSidebarPanel>
  );
}
