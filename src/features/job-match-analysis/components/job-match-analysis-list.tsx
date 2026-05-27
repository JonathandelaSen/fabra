"use client";

import { Briefcase, Clock, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import { FeatureSidebarPanel } from "@/components/shared/feature-sidebar-panel";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobMatchAnalysisSummary } from "../api/job-match-analysis-api";
import type { JobMatchAnalysisOfferStatus } from "@/app/api/job-match-analyses/responses";
import { cn } from "@/lib/utils";

const OFFER_STATUS_BADGE_CLASS: Record<JobMatchAnalysisOfferStatus, string> = {
  interesante: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  aplicado: "border-indigo-500/20 bg-indigo-500/10 text-indigo-300",
  entrevista: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  oferta: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  rechazado: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  descartado: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

const getScoreColor = (score: number | null) => {
  if (score === null) return "";
  if (score >= 80) return "text-emerald-400 bg-emerald-500/15 border-emerald-500/20";
  if (score >= 60) return "text-amber-400 bg-amber-500/15 border-amber-500/20";
  return "text-rose-400 bg-rose-500/15 border-rose-500/20";
};

const formatDate = (dateStr: string, locale: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function JobAnalysesListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex w-full items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-3"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg bg-emerald-500/10" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <div className="mt-2 flex items-center gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-7 w-10 shrink-0 rounded-lg" />
          <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

interface JobMatchAnalysisListProps {
  analyses: JobMatchAnalysisSummary[];
  selectedId: string | null;
  searchQuery: string;
  onSelect: (id: string) => void;
  onSearchChange: (value: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function JobMatchAnalysisList({
  analyses,
  selectedId,
  searchQuery,
  onSelect,
  onSearchChange,
  onDelete,
  isLoading = false,
}: JobMatchAnalysisListProps) {
  const t = useTranslations("analysisFlow.lists");
  const common = useTranslations("common");
  const navigation = useTranslations("navigation");
  const { locale } = useInterfaceLanguage();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  return (
    <FeatureSidebarPanel
      header={
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
              {t("jobCount", { count: analyses.length })}
            </p>
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="search"
              placeholder={t("searchOffers")}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-3 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/40"
            />
          </label>
        </div>
      }
    >
      {isLoading ? (
        <JobAnalysesListSkeleton />
      ) : analyses.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
            <Briefcase className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-zinc-400">
            {searchQuery ? t("noMatches") : t("jobEmptyTitle")}
          </p>
          {!searchQuery && (
            <p className="mt-1 text-xs text-zinc-600">
              {t("jobEmptyDescription")}
            </p>
          )}
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
              className={cn(
                "group flex w-full cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-left transition-all",
                selectedId === analysis.id
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.10] hover:bg-white/[0.06]",
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                <Briefcase className="h-4 w-4 text-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-200">
                    {analysis.title || analysis.filename.replace(/\.pdf$/i, "")}
                  </p>
                  {analysis.aiScore !== null ? (
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold ${getScoreColor(analysis.aiScore)}`}
                    >
                      {analysis.aiScore}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-zinc-800/70 px-1.5 py-0.5 text-[10px] text-zinc-500">
                      {common("states.pending")}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Clock className="h-3 w-3" />
                    {formatDate(analysis.createdAt, dateLocale)}
                  </span>
                  {analysis.offerStatus && (
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${OFFER_STATUS_BADGE_CLASS[analysis.offerStatus]}`}
                    >
                      {navigation(`offerStatuses.${analysis.offerStatus}`)}
                    </span>
                  )}
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
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-600 opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100 group-focus-visible:opacity-100"
                aria-label={t("deleteOffer")}
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
