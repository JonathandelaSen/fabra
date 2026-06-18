"use client";

import { Briefcase, FileSearch, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormattedDate } from "@/components/shared/formatted-date";
import type { AnalysisMode, AnalysisSummary } from "@/lib/analysis-types";

interface CVLibraryAssociatedAnalysesProps {
  analyses: AnalysisSummary[];
  onOpenAnalysis: (id: string, mode?: AnalysisMode) => void;
}

export function CVLibraryAssociatedAnalyses({
  analyses,
  onOpenAnalysis,
}: CVLibraryAssociatedAnalysesProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  if (analyses.length <= 0) {
    return (
      <div className="rounded-lg border border-dashed border-line/[0.06] p-4 text-center text-xs text-text-muted">
        {t("noAssociatedAnalyses")}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {analyses.map((analysis) => (
        <a
          key={analysis.id}
          href={
            analysis.analysis_mode === "job_match"
              ? `/job-analyses/${encodeURIComponent(analysis.id)}`
              : `/cv-analysis/${encodeURIComponent(analysis.id)}`
          }
          onClick={(event) => {
            event.preventDefault();
            onOpenAnalysis(analysis.id, analysis.analysis_mode);
          }}
          className="group flex min-w-0 items-center gap-3 rounded-lg border border-line/[0.04] bg-panel/[0.02] p-2.5 transition-all hover:border-accent-teal-border hover:bg-accent-teal/[0.04]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-control/60 text-text-muted group-hover:bg-accent-teal/10 group-hover:text-accent-teal-text transition-colors">
            {analysis.analysis_mode === "job_match" ? (
              <Briefcase className="h-3.5 w-3.5" />
            ) : (
              <FileSearch className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-text-soft group-hover:text-text-main">
              {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
            </span>
            <FormattedDate
              value={analysis.created_at}
              className="mt-0.5 text-[10px]"
              iconClassName="h-2.5 w-2.5"
            />
          </span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-faint group-hover:text-accent-teal-text transition-colors" />
        </a>
      ))}
    </div>
  );
}
