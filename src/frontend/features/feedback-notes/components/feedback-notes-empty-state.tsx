"use client";

import { MessageSquareQuote, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/components/shared/action-buttons";
import { FeatureEmptyState } from "@/components/shared/feature-empty-state";

interface FeedbackNotesEmptyStateProps {
  onCreate: () => void;
}

export function FeedbackNotesEmptyState({
  onCreate,
}: FeedbackNotesEmptyStateProps) {
  const t = useTranslations("feedbackNotes");

  return (
    <FeatureEmptyState
      icon={MessageSquareQuote}
      title={t("empty")}
      action={
        <IconTextButton
          icon={Plus}
          tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
          onClick={onCreate}
        >
          {t("actions.newNote")}
        </IconTextButton>
      }
    />
  );
}
