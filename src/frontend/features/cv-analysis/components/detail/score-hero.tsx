"use client";

import { useTranslations } from "next-intl";
import {
  Cpu,
  FileText,
  ExternalLink,
} from "lucide-react";
import AnalysisScoreCircle from "@/frontend/components/shared/analysis-score-circle";
import { AnalysisMarkdown } from "@/frontend/components/shared/analysis-markdown";
import { FormattedDate } from "@/frontend/components/shared/formatted-date";
import { getScoreColor } from "@/frontend/utils/format";

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
          <h3 className="text-xl font-bold text-text-main">
            {title || t("qualityScore")}
          </h3>
          <AnalysisMarkdown content={feedback} className="text-base" />

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

          </div>
        </div>
      </div>
    </div>
  );
}
