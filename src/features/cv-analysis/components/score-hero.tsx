"use client";

import { useTranslations } from "next-intl";
import {
  Cpu,
  Briefcase,
  FileSearch,
  FileText,
  ExternalLink,
} from "lucide-react";
import type { AnalysisMode, OfferStatus } from "@/lib/analysis-types";
import AnalysisScoreCircle from "@/components/shared/analysis-score-circle";
import { FormattedDate } from "@/components/shared/formatted-date";
import { getScoreColor } from "@/lib/format";
import { ScoreHeroActions } from "./score-hero-actions";
import { ScoreHeroJobUrl } from "./score-hero-job-url";
import { ScoreHeroTracking } from "./score-hero-tracking";

interface ScoreHeroProps {
  score: number;
  title: string;
  feedback: string;
  model: string;
  analyzedAt: string;
  analysisMode: AnalysisMode;
  jobDescription: string | null;
  jobUrl: string | null;
  cv: { id: string; name: string; filename: string; type?: string } | null;
  cvId: string | null;
  filename: string;
  onExport: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  onSaveUrl: (url: string) => Promise<void>;
  isSavingUrl: boolean;
  offerStatus?: OfferStatus | null;
  offerNextAction?: string | null;
  offerNextActionAt?: string | null;
  onTabChange?: (tab: string) => void;
  onOfferStatusChange?: (status: OfferStatus) => Promise<void>;
  isSavingTracking?: boolean;
}

function getScoreLabelKey(score: number) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "improvable";
  return "needsWork";
}

export default function ScoreHero({
  score,
  title,
  feedback,
  model,
  analyzedAt,
  analysisMode,
  jobDescription,
  jobUrl,
  cv,
  cvId,
  filename,
  onExport,
  onDelete,
  isDeleting,
  onSaveUrl,
  isSavingUrl,
  offerStatus,
  offerNextAction,
  offerNextActionAt,
  onTabChange,
  onOfferStatusChange,
  isSavingTracking,
}: ScoreHeroProps) {
  const t = useTranslations("analysisDetail.score");
  const colors = getScoreColor(score);

  const cvHref =
    cv?.type === "template"
      ? `/api/cvs/${cv.id}/template-pdf`
      : `/api/cvs/${cv?.id ?? cvId}/pdf`;

  const hasCv = cv || cvId;

  return (
    <div
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 backdrop-blur-sm`}
    >
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 w-full">
        {/* Main Details and Score */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 min-w-0 w-full">
          <AnalysisScoreCircle
            score={score}
            textClassName={colors.text}
            strokeClassName={colors.stroke}
          />

          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 w-full">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border`}
                >
                  {t(getScoreLabelKey(score))}
                </span>
                {analysisMode === "general" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">
                    <FileSearch className="w-3 h-3" />
                    {t("general")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <Briefcase className="w-3 h-3" />
                    {t("jobMatch")}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-zinc-100">
                {title ||
                  (analysisMode === "general"
                    ? t("qualityScore")
                    : t("matchScore"))}
              </h3>
            </div>
            <p className="text-zinc-400 leading-relaxed text-sm line-clamp-3">
              {feedback}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">
                <Cpu className="w-3 h-3" />
                {model}
              </span>
              <FormattedDate
                value={analyzedAt}
                variant="dateTime"
                className="gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-md"
              />
              {jobDescription && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">
                  <Briefcase className="w-3 h-3" />
                  {t("withOffer")}
                </span>
              )}

              {hasCv && (
                <>
                  <span className="text-zinc-700 text-[10px]">|</span>
                  <a
                    href={cvHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 px-2 py-1 rounded-md transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    {cv?.name ?? filename}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </>
              )}

              {analysisMode === "job_match" && (
                <ScoreHeroJobUrl
                  jobUrl={jobUrl}
                  onSaveUrl={onSaveUrl}
                  isSavingUrl={isSavingUrl}
                />
              )}
            </div>

            <ScoreHeroActions
              onExport={onExport}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </div>
        </div>

        {/* Right tracking widget (if in job match mode) */}
        {analysisMode === "job_match" && (
          <ScoreHeroTracking
            offerStatus={offerStatus}
            offerNextAction={offerNextAction}
            offerNextActionAt={offerNextActionAt}
            onTabChange={onTabChange}
            onOfferStatusChange={onOfferStatusChange}
            isSavingTracking={isSavingTracking}
          />
        )}
      </div>
    </div>
  );
}
