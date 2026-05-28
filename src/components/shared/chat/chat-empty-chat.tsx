"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export function ChatEmptyChat() {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-600">
        <Sparkles className="size-5" />
      </div>
      <div>
        <p className="text-sm text-zinc-400">{t("firstQuestion")}</p>
        <p className="mt-1 text-xs text-zinc-600">
          {t("firstQuestionDescription")}
        </p>
      </div>
    </div>
  );
}
