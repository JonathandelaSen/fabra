"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Cpu,
  Briefcase,
  FileText,
  ExternalLink,
  Loader2,
  Check,
  X,
  Plus,
  Pencil,
} from "lucide-react";
import type { OfferStatus } from "@/lib/analysis-types";
import { type DetailTab } from "../../types";
import { JOB_MATCH_DETAIL_TABS } from "../../constants";
import AnalysisScoreCircle from "@/components/shared/analysis-score-circle";
import { FormattedDate } from "@/components/shared/formatted-date";
import { getScoreColor } from "@/lib/format";
import { ScoreHeroOfferStatusBadge } from "./score-hero-offer-status-badge";

interface ScoreHeroProps {
  score: number;
  title: string;
  feedback: string;
  model: string;
  analyzedAt: string;
  jobDescription: string | null;
  jobUrl: string | null;
  cv: { id: string; name: string; filename: string | null; type?: string } | null;
  cvId: string | null;
  filename: string;
  onSaveUrl: (url: string) => Promise<void>;
  isSavingUrl: boolean;
  offerStatus?: OfferStatus | null;
  onTabChange?: (tab: DetailTab) => void;
}

const URL_PLACEHOLDER = "https://...";

function getUrlHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    try {
      return new URL(`https://${url}`).hostname;
    } catch {
      return url;
    }
  }
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
  jobDescription,
  jobUrl,
  cv,
  cvId,
  filename,
  onSaveUrl,
  isSavingUrl,
  offerStatus,
  onTabChange,
}: ScoreHeroProps) {
  const t = useTranslations("analysisDetail.score");
  const colors = getScoreColor(score);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editedUrl, setEditedUrl] = useState(jobUrl || "");

  const handleSaveUrl = async () => {
    await onSaveUrl(editedUrl.trim());
    setIsEditingUrl(false);
  };

  const cvHref =
    cv?.type === "template"
      ? `/api/cvs/${cv.id}/template-pdf`
      : `/api/cvs/${cv?.id ?? cvId}/pdf`;

  const hasCv = cv || cvId;

  return (
    <div
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 backdrop-blur-sm`}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
        <AnalysisScoreCircle
          score={score}
          textClassName={colors.text}
          strokeClassName={colors.stroke}
        />

        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 w-full">
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                {t(getScoreLabelKey(score))}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 border border-success-border text-success-text">
                <Briefcase className="w-3 h-3" />
                {t("jobMatch")}
              </span>

              <ScoreHeroOfferStatusBadge
                offerStatus={offerStatus}
                onTabChange={onTabChange}
                tabValue={JOB_MATCH_DETAIL_TABS.tracking}
              />
            </div>
            <h3 className="text-xl font-bold text-text-main">
              {title || t("matchScore")}
            </h3>
          </div>
          <p className="text-text-soft leading-relaxed text-base">
            {feedback}
          </p>

          {/* Meta row: model, date, CV, URL */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted bg-panel-control/50 px-2 py-1 rounded-md">
              <Cpu className="w-3 h-3" />
              {model}
            </span>
            <FormattedDate
              value={analyzedAt}
              variant="dateTime"
              className="gap-1.5 bg-panel-control/50 px-2 py-1 rounded-md"
            />
            {jobDescription && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted bg-panel-control/50 px-2 py-1 rounded-md">
                <Briefcase className="w-3 h-3" />
                {t("withOffer")}
              </span>
            )}

            {/* CV link inline */}
            {hasCv && (
              <>
                <span className="text-text-faint text-[10px]">|</span>
                <a
                  href={cvHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-info-text bg-info/10 hover:bg-info/20 border border-info-border/20 px-2 py-1 rounded-md transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  {cv?.name ?? filename}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </>
            )}

            {/* Job URL inline */}
            <>
              <span className="text-text-faint text-[10px]">|</span>
              {isEditingUrl ? (
                <div className="inline-flex items-center gap-1.5">
                  <input
                    type="url"
                    value={editedUrl}
                    onChange={(e) => setEditedUrl(e.target.value)}
                    placeholder={URL_PLACEHOLDER}
                    className="h-6 w-48 rounded-md bg-field border border-line px-2 text-[11px] text-text-main focus:outline-none focus:border-success-border"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUrl}
                    disabled={isSavingUrl}
                    className="p-1 rounded-md bg-success/10 hover:bg-success/20 text-success-text transition-colors"
                  >
                    {isSavingUrl ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUrl(false);
                      setEditedUrl(jobUrl || "");
                    }}
                    disabled={isSavingUrl}
                    className="p-1 rounded-md bg-danger-soft hover:bg-danger-soft text-danger-text transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : jobUrl ? (
                <span className="inline-flex items-center gap-1">
                  <a
                    href={jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success-text bg-success/10 hover:bg-success/20 border border-success-border px-2 py-1 rounded-md transition-colors max-w-[180px] truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {getUrlHostname(jobUrl)}
                  </a>
                  <button
                    onClick={() => {
                      setEditedUrl(jobUrl);
                      setIsEditingUrl(true);
                    }}
                    className="p-1 rounded-md text-text-muted hover:text-text-soft hover:bg-panel-control transition-colors"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => {
                    setEditedUrl("");
                    setIsEditingUrl(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted bg-panel-control/50 hover:bg-panel-control px-2 py-1 rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {t("offerUrl")}
                </button>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
