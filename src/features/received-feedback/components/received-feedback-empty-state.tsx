"use client";

import { MessageSquareQuote, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ReceivedFeedbackEmptyStateProps {
  onCreate: () => void;
}

export function ReceivedFeedbackEmptyState({
  onCreate,
}: ReceivedFeedbackEmptyStateProps) {
  const t = useTranslations("receivedFeedback");

  return (
    <div className="rounded-xl border border-dashed border-line-default py-24 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-panel-subtle text-text-muted border border-line">
        <MessageSquareQuote className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-text-soft">
        {t("empty")}
      </h3>
      <p className="mt-1.5 text-xs text-text-muted">
        {t("emptySelection")}
      </p>
      <div className="mt-6">
        <Button
          onClick={onCreate}
          className="bg-action hover:bg-action-hover text-text-main"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t("newFeedback")}
        </Button>
      </div>
    </div>
  );
}
