"use client";

import { Clock } from "lucide-react";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { cn } from "@/lib/utils";
import type { JobMatchAnalysisSummary } from "../api/job-match-analysis-api";
import { JobMatchAnalysisScoreBadge } from "./job-match-analysis-score-badge";
import { JobMatchAnalysisStatusBadge } from "./job-match-analysis-status-badge";

interface JobMatchAnalysisListItemProps {
  analysis: JobMatchAnalysisSummary;
  selected: boolean;
  onSelect: () => void;
}

const formatDate = (dateStr: string, locale: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function JobMatchAnalysisListItem({
  analysis,
  selected,
  onSelect,
}: JobMatchAnalysisListItemProps) {
  const { locale } = useInterfaceLanguage();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
        selected
          ? "bg-panel-selected border-action-border text-zinc-100 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          : "bg-transparent border-transparent text-zinc-400 hover:bg-[#13131c]/60 hover:border-white/[0.04] hover:text-zinc-200",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-action-text">
            {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
          </p>
          <JobMatchAnalysisScoreBadge score={analysis.aiScore} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Clock className="h-3 w-3" />
            {formatDate(analysis.createdAt, dateLocale)}
          </span>
          {analysis.offerStatus && (
            <JobMatchAnalysisStatusBadge status={analysis.offerStatus} />
          )}
        </div>
      </div>

    </div>
  );
}
