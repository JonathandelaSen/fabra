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
    <div className="rounded-xl border border-dashed border-white/10 py-24 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] text-zinc-500 border border-white/5">
        <MessageSquareQuote className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-200">
        {t("empty")}
      </h3>
      <p className="mt-1.5 text-xs text-zinc-500">
        Select an existing feedback card or create a new one to begin.
      </p>
      <div className="mt-6">
        <Button
          onClick={onCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t("newFeedback")}
        </Button>
      </div>
    </div>
  );
}
