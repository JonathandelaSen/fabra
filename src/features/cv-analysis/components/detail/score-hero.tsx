"use client";

import { useTranslations } from "next-intl";
import {
  Cpu,
  FileSearch,
  FileText,
  ExternalLink,
} from "lucide-react";
import AnalysisScoreCircle from "@/components/shared/analysis-score-circle";
import { AnalysisMarkdown } from "@/components/shared/analysis-markdown";
import { FormattedDate } from "@/components/shared/formatted-date";
import { getScoreColor } from "@/lib/format";

interface ScoreHeroProps {
  score: number;
  title: string;
  feedback: string;
  model: string;
  analyzedAt: string;
  cv: { id: string; name: string; filename: string; type?: string } | null;
  cvId: string | null;
  filename: string;
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
  cv,
  cvId,
  filename,
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
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">
                <FileSearch className="w-3 h-3" />
                {t("general")}
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-100">
              {title || t("qualityScore")}
            </h3>
          </div>
          <AnalysisMarkdown content={feedback} className="text-base" />

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

          </div>
        </div>
      </div>
    </div>
  );
}
