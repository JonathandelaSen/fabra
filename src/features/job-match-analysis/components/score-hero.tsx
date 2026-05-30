"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Cpu,
  Briefcase,
  FileDown,
  FileText,
  ExternalLink,
  Loader2,
  Check,
  X,
  Plus,
  Pencil,
} from "lucide-react";
import AnalysisScoreCircle from "@/components/shared/analysis-score-circle";
import { FormattedDate } from "@/components/shared/formatted-date";
import { getScoreColor } from "@/lib/format";

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
  onExport: () => void;
  onSaveUrl: (url: string) => Promise<void>;
  isSavingUrl: boolean;
}

const URL_PLACEHOLDER = "https://...";

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
  onExport,
  onSaveUrl,
  isSavingUrl,
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
      <div className="flex flex-col md:flex-row items-center gap-6">
        <AnalysisScoreCircle
          score={score}
          textClassName={colors.text}
          strokeClassName={colors.stroke}
        />

        {/* Score Info */}
        <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                {t(getScoreLabelKey(score))}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <Briefcase className="w-3 h-3" />
                {t("jobMatch")}
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100">
              {title || t("matchScore")}
            </h3>
          </div>
          <p className="text-zinc-400 leading-relaxed text-sm line-clamp-3">
            {feedback}
          </p>

          {/* Meta row: model, date, CV, URL */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
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

            {/* CV link inline */}
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

            {/* Job URL inline */}
            <>
              <span className="text-zinc-700 text-[10px]">|</span>
              {isEditingUrl ? (
                <div className="inline-flex items-center gap-1.5">
                  <input
                    type="url"
                    value={editedUrl}
                    onChange={(e) => setEditedUrl(e.target.value)}
                    placeholder={URL_PLACEHOLDER}
                    className="h-6 w-48 rounded-md bg-[#0a0a12] border border-white/[0.06] px-2 text-[11px] text-zinc-300 focus:outline-none focus:border-emerald-500/40"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUrl}
                    disabled={isSavingUrl}
                    className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
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
                    className="p-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
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
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2 py-1 rounded-md transition-colors max-w-[180px] truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {new URL(jobUrl).hostname}
                  </a>
                  <button
                    onClick={() => {
                      setEditedUrl(jobUrl);
                      setIsEditingUrl(true);
                    }}
                    className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
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
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 bg-zinc-800/50 hover:bg-zinc-800 px-2 py-1 rounded-md transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {t("offerUrl")}
                </button>
              )}
            </>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-md transition-all"
            >
              <FileDown className="w-3.5 h-3.5" />
              {t("export")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
