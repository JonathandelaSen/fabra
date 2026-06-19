"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Plus } from "lucide-react";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";

interface ChatEmptyStateProps {
  onNew: () => void;
  labels?: {
    title: string;
    description: string;
    newConversation: string;
  };
}

export function ChatEmptyState({ onNew, labels }: ChatEmptyStateProps) {
  const t = useTranslations("analysisDetail.chat");
  const title = labels?.title ?? t("startTitle");
  const description = labels?.description ?? t("startDescription");
  const newConversation = labels?.newConversation ?? t("newConversation");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-info-soft text-info-text">
        <MessageCircle className="size-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-soft">
          {title}
        </p>
        <p className="mt-1 text-xs text-text-faint">
          {description}
        </p>
      </div>
      <IconTextButton
        icon={Plus}
        tone={ICON_TEXT_BUTTON_TONES.INFO}
        onClick={onNew}
        className="mt-1"
      >
        {newConversation}
      </IconTextButton>
    </div>
  );
}
