"use client";

import { Briefcase, FileSearch, Clock, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisSummary } from "@/lib/analysis-types";

interface CVLibraryAssociatedAnalysesProps {
  analyses: AnalysisSummary[];
  onOpenAnalysis: (id: string) => void;
  formatDate: (dateStr: string) => string;
}

export function CVLibraryAssociatedAnalyses({
  analyses,
  onOpenAnalysis,
  formatDate,
}: CVLibraryAssociatedAnalysesProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  if (analyses.length <= 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/[0.06] p-4 text-center text-xs text-zinc-500">
        {t("noAssociatedAnalyses")}
      </div>
    );
  }

  return (
    <div className="grid gap-2 max-h-36 overflow-y-auto pr-1 sm:grid-cols-2">
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
            onOpenAnalysis(analysis.id);
          }}
          className="group flex min-w-0 items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5 transition-all hover:border-teal-500/20 hover:bg-teal-500/[0.04]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-500 group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-colors">
            {analysis.analysis_mode === "job_match" ? (
              <Briefcase className="h-3.5 w-3.5" />
            ) : (
              <FileSearch className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-zinc-200 group-hover:text-zinc-100">
              {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500">
              <Clock className="h-2.5 w-2.5" />
              {formatDate(analysis.created_at)}
            </span>
          </span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-teal-400 transition-colors" />
        </a>
      ))}
    </div>
  );
}
