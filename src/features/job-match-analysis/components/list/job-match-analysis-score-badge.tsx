"use client";

import { useTranslations } from "next-intl";

const getScoreColor = (score: number | null) => {
  if (score === null) return "";
  if (score >= 80) return "text-emerald-400 bg-emerald-500/15 border-emerald-500/20";
  if (score >= 60) return "text-amber-400 bg-amber-500/15 border-amber-500/20";
  return "text-rose-400 bg-rose-500/15 border-rose-500/20";
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
    <span className="shrink-0 rounded-md bg-zinc-800/70 px-1.5 py-0.5 text-[10px] text-zinc-500">
      {common("states.pending")}
    </span>
  );
}
