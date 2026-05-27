"use client";

import { useTranslations } from "next-intl";

interface CVLibraryTypeBadgeProps {
  cvType: string;
}

export function CVLibraryTypeBadge({ cvType }: CVLibraryTypeBadgeProps) {
  const t = useTranslations("analysisFlow.cvLibrary");

  if (cvType === "template") {
    return (
      <span className="shrink-0 rounded border border-teal-500/25 bg-teal-500/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase text-teal-400">
        {t("typeTemplate")}
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded border border-zinc-500/20 bg-zinc-500/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase text-zinc-400">
      {t("typeOriginal")}
    </span>
  );
}
