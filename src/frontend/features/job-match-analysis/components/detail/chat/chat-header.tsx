"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export function ChatHeader() {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 border-b border-line px-3 py-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-info-soft to-info-soft text-info-text">
          <Sparkles className="size-3.5" />
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-medium text-text-soft">
            {t("title")}
          </h4>
          <p className="truncate text-[11px] text-text-faint">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <span className="hidden shrink-0 text-[11px] text-text-faint sm:inline">
        {t("modelLabel")}
      </span>
    </div>
  );
}
