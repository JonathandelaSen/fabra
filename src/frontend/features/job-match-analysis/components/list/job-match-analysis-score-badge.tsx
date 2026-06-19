"use client";

import { useTranslations } from "next-intl";

const getScoreColor = (score: number | null) => {
  if (score === null) return "";
  if (score >= 80) return "text-score-high-text bg-score-high-soft border-score-high-border";
  if (score >= 60) return "text-score-mid-text bg-score-mid-soft border-score-mid-border";
  return "text-score-low-text bg-score-low-soft border-score-low-border";
};

interface JobMatchAnalysisScoreBadgeProps {
  score: number | null;
}

export function JobMatchAnalysisScoreBadge({ score }: JobMatchAnalysisScoreBadgeProps) {
  const common = useTranslations("common");

  if (score !== null) {
    return (
      <span
        className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-bold ${getScoreColor(score)}`}
      >
        {score}
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-md bg-panel-control px-1.5 py-0.5 text-[10px] text-text-muted">
      {common("states.pending")}
    </span>
  );
}
