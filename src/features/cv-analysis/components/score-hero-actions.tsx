"use client";

import { useTranslations } from "next-intl";
import { FileDown, Trash2, Loader2 } from "lucide-react";

interface ScoreHeroActionsProps {
  onExport: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ScoreHeroActions({
  onExport,
  onDelete,
  isDeleting,
}: ScoreHeroActionsProps) {
  const t = useTranslations("analysisDetail.score");
  const common = useTranslations("common.actions");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onExport}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-md transition-all"
      >
        <FileDown className="w-3.5 h-3.5" />
        {t("export")}
      </button>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1 rounded-md transition-all disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        {isDeleting ? common("deleting") : common("delete")}
      </button>
    </div>
  );
}
