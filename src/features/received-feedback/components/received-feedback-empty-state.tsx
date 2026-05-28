"use client";

import { MessageSquareQuote, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FeatureEmptyState } from "@/components/shared/feature-empty-state";

interface ReceivedFeedbackEmptyStateProps {
  onCreate: () => void;
}

export function ReceivedFeedbackEmptyState({
  onCreate,
}: ReceivedFeedbackEmptyStateProps) {
  const t = useTranslations("receivedFeedback");

  return (
    <FeatureEmptyState
      icon={MessageSquareQuote}
      title={t("empty")}
      description={t("emptySelection")}
      action={
        <Button
          onClick={onCreate}
          className="bg-action hover:bg-action-hover text-text-main"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t("newFeedback")}
        </Button>
      }
    />
  );
}
