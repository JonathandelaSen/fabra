"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <p className="text-sm font-medium text-zinc-300">
          {t("startTitle")}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          {t("startDescription")}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onNew}
        className="mt-1 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
      >
        <Plus className="mr-1.5 size-3.5" />
        {t("newConversation")}
      </Button>
    </div>
  );
}
