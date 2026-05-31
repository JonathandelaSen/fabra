"use client";

import { FileSearch, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
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
    <AlertBanner tone={ALERT_BANNER_TONES.DANGER}>
      <p>{error}</p>
      {blockingAnalyses.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-danger-border pt-3">
          <p className="text-xs font-semibold">
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
              className="flex items-center gap-2 rounded-lg border border-line bg-panel-elevated px-3 py-2 text-left text-xs text-text-soft transition-colors hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-danger-text"
            >
              <FileSearch className="h-3.5 w-3.5 shrink-0 text-danger-text" />
              <span className="min-w-0 flex-1 truncate">
                {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ))}
        </div>
      )}
    </AlertBanner>
  );
}
