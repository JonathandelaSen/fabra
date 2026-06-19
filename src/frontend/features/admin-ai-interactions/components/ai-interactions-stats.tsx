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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-5 shrink-0">
      <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsVisible")}
        </span>
        <span className="text-2xl font-bold font-mono text-text-main">
          {visibleRuns}
        </span>
      </div>
      
      <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsErrorRate")}
        </span>
        <span className="text-2xl font-bold font-mono text-danger-text">
          {errorPercent}%
        </span>
        <span className="text-[10px] text-text-muted">
          {t("metricsErrorDesc", { count: errorCount })}
        </span>
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsModels")}
        </span>
        <span className="text-2xl font-bold font-mono text-text-main">
          {modelsCount}
        </span>
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsAvgLatency")}
        </span>
        <span className="text-2xl font-bold font-mono text-text-main">
          {avgLatency}
        </span>
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-xs col-span-2 sm:col-span-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {t("metricsReviewed")}
        </span>
        <span className="text-2xl font-bold font-mono text-text-main">
          {reviewedCount}
        </span>
        <span className="text-[10px] text-text-muted">
          {t("metricsReviewedDesc", { count: reviewedCount })}
        </span>
      </div>
    </div>
  );
}
