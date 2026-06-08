"use client";

import { Sparkles, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

interface GeneralAnalysisFormHeaderProps {
  onBack: () => void;
}

export function GeneralAnalysisFormHeader({ onBack }: GeneralAnalysisFormHeaderProps) {
  const t = useTranslations("analysisFlow.forms");

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300">
          <Sparkles className="w-3.5 h-3.5" />
          {t("generalTitle")}
        </div>
        <span className="text-[10px] text-zinc-600">
          {t("allFieldsOptional")}
        </span>
      </div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t("changeMode")}
      </button>
    </div>
  );
}
