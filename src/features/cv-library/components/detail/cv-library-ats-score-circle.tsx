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

  if (displayScore !== null) {
    const getScoreColor = (val: number) => {
      if (val >= 80) return { text: "text-emerald-400", stroke: "stroke-emerald-400" };
      if (val >= 55) return { text: "text-amber-400", stroke: "stroke-amber-400" };
      return { text: "text-rose-400", stroke: "stroke-rose-400" };
    };

    const scoreColors = getScoreColor(displayScore);

    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.04] bg-[#0c0c14]/50 p-4 self-start shadow-xl shadow-black/20">
        <AnalysisScoreCircle
          score={displayScore}
          textClassName={scoreColors.text}
          strokeClassName={scoreColors.stroke}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-[#0c0c14]/20 p-4 self-start shadow-inner">
      <div className="relative w-32 h-32 flex flex-col items-center justify-center text-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            className="fill-none stroke-white/[0.06] stroke-dashed"
            strokeWidth="4"
            strokeDasharray="4 4"
          />
        </svg>
        <Sparkles className="h-6 w-6 text-zinc-600 animate-pulse " />
        <span className="text-[9px] font-bold text-zinc-500 max-w-[100px] leading-snug select-none p-2">
          {t("generateMatchScorePrompt")}
        </span>
      </div>
    </div>
  );
}
