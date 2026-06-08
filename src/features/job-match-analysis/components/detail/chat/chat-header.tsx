"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export function ChatHeader() {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-400">
          <Sparkles className="size-3.5" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-zinc-200">
            {t("title")}
          </h4>
          <p className="text-[11px] text-zinc-600">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <span className="text-[11px] text-zinc-600">{t("modelLabel")}</span>
    </div>
  );
}
