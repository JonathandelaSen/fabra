"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import AnalysisScoreCircle from "@/components/shared/analysis-score-circle";

interface CVLibraryAtsScoreCircleProps {
  displayScore: number | null;
}

export function CVLibraryAtsScoreCircle({
  displayScore,
}: CVLibraryAtsScoreCircleProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  const getScoreColor = (val: number) => {
    if (val >= 80) return { text: "text-emerald-400", stroke: "stroke-teal-400" };
    if (val >= 55) return { text: "text-amber-400", stroke: "stroke-amber-400" };
    return { text: "text-rose-400", stroke: "stroke-rose-400" };
  };

  const scoreColors = displayScore !== null ? getScoreColor(displayScore) : null;

  if (displayScore !== null && scoreColors) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.04] bg-[#0c0c14]/50 p-4">
        <span className="hidden md:block mb-2 text-[10px] font-semibold tracking-wider uppercase text-zinc-500">
          {t("generalAtsScore")}
        </span>
        <AnalysisScoreCircle
          score={displayScore}
          textClassName={scoreColors.text}
          strokeClassName={scoreColors.stroke}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-5 text-center max-w-[170px] mx-auto lg:mx-0">
      <Sparkles className="mb-2 h-6 w-6 text-zinc-600 animate-pulse" />
      <span className="hidden md:block text-[10px] font-semibold tracking-wider uppercase text-zinc-500">
        {t("generalAtsScore")}
      </span>
      <p className="mt-1 text-[11px] text-zinc-600 leading-normal">
        {t("generateMatchScorePrompt")}
      </p>
    </div>
  );
}
