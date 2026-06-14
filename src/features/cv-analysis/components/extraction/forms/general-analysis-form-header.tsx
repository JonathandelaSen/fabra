"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function GeneralAnalysisFormHeader() {
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
    </div>
  );
}
