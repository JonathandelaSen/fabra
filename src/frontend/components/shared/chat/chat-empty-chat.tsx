"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export function ChatEmptyChat({
  labels,
}: {
  labels?: { title: string; description: string };
}) {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-panel-subtle text-text-faint">
        <Sparkles className="size-5" />
      </div>
      <div>
        <p className="text-sm text-text-muted">{labels?.title ?? t("firstQuestion")}</p>
        <p className="mt-1 text-xs text-text-faint">
          {labels?.description ?? t("firstQuestionDescription")}
        </p>
      </div>
    </div>
  );
}
