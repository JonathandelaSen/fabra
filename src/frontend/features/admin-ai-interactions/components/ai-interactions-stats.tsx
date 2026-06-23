"use client";

import { useTranslations } from "next-intl";

interface AIInteractionsStatsProps {
  visibleRuns: number;
  errorPercent: number;
  errorCount: number;
  modelsCount: number;
  avgLatency: string;
  reviewedCount: number;
}

export function AIInteractionsStats({
  visibleRuns,
  errorPercent,
  errorCount,
  modelsCount,
  avgLatency,
  reviewedCount,
}: AIInteractionsStatsProps) {
  const t = useTranslations("admin.aiInteractions");

  return (
    <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      <div className="flex min-h-16 flex-col justify-between rounded-lg border border-border/50 bg-card/70 p-2.5 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsVisible")}
        </span>
        <span className="text-xl font-bold font-mono text-text-main">
          {visibleRuns}
        </span>
      </div>
      
      <div className="flex min-h-16 flex-col justify-between rounded-lg border border-border/50 bg-card/70 p-2.5 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsErrorRate")}
        </span>
        <span className="text-xl font-bold font-mono text-danger-text">
          {errorPercent}%
        </span>
        <span className="text-[10px] text-text-muted">
          {t("metricsErrorDesc", { count: errorCount })}
        </span>
      </div>

      <div className="flex min-h-16 flex-col justify-between rounded-lg border border-border/50 bg-card/70 p-2.5 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsModels")}
        </span>
        <span className="text-xl font-bold font-mono text-text-main">
          {modelsCount}
        </span>
      </div>

      <div className="flex min-h-16 flex-col justify-between rounded-lg border border-border/50 bg-card/70 p-2.5 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsAvgLatency")}
        </span>
        <span className="text-xl font-bold font-mono text-text-main">
          {avgLatency}
        </span>
      </div>

      <div className="col-span-2 flex min-h-16 flex-col justify-between rounded-lg border border-border/50 bg-card/70 p-2.5 shadow-xs sm:col-span-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsReviewed")}
        </span>
        <span className="text-xl font-bold font-mono text-text-main">
          {reviewedCount}
        </span>
        <span className="text-[10px] text-text-muted">
          {t("metricsReviewedDesc", { count: reviewedCount })}
        </span>
      </div>
    </div>
  );
}
