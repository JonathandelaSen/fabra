"use client";

import { Briefcase, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

interface JobMatchFormHeaderProps {
  onBack: () => void;
}

export function JobMatchFormHeader({ onBack }: JobMatchFormHeaderProps) {
  const t = useTranslations("analysisFlow.forms");

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300">
          <Briefcase className="w-3.5 h-3.5" />
          {t("jobTitle")}
        </div>
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
