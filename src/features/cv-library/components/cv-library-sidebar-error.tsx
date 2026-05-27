"use client";

import { FileSearch, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AnalysisSummary } from "@/lib/analysis-types";

interface CVLibrarySidebarErrorProps {
  error: string | null;
  blockingAnalyses: AnalysisSummary[];
  onOpenAnalysis: (id: string) => void;
}

export function CVLibrarySidebarError({
  error,
  blockingAnalyses,
  onOpenAnalysis,
}: CVLibrarySidebarErrorProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  if (!error) return null;

  return (
    <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
      <p>{error}</p>
      {blockingAnalyses.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-rose-500/20 pt-3">
          <p className="text-xs font-semibold text-rose-200">
            {t("associatedAnalyses")}
          </p>
          {blockingAnalyses.map((analysis) => (
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
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0a0a12]/70 px-3 py-2 text-left text-xs text-zinc-300 transition-colors hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-100"
            >
              <FileSearch className="h-3.5 w-3.5 shrink-0 text-rose-300" />
              <span className="min-w-0 flex-1 truncate">
                {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
