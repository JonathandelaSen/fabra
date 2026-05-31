"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Plus } from "lucide-react";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";

interface ChatEmptyStateProps {
  onNew: () => void;
}

export function ChatEmptyState({ onNew }: ChatEmptyStateProps) {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
        <MessageCircle className="size-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-soft">
          {t("startTitle")}
        </p>
        <p className="mt-1 text-xs text-text-faint">
          {t("startDescription")}
        </p>
      </div>
      <IconTextButton
        icon={Plus}
        tone={ICON_TEXT_BUTTON_TONES.INFO}
        onClick={onNew}
        className="mt-1"
      >
        {t("newConversation")}
      </IconTextButton>
    </div>
  );
}
