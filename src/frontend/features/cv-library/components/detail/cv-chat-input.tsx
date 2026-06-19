"use client";

import { FormEvent, RefObject } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/frontend/components/ui/textarea";
import AIActionLauncher from "@/frontend/components/shared/ai-action-launcher";
import type { StoredAIProvider } from "@/lib/browser-preferences";

interface ChatInputProps {
  draft: string;
  onDraftChange: (value: string) => void;
  isSending: boolean;
  onSubmit: (event?: FormEvent) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  hasAIApiKey: boolean;
  provider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  model: string;
  aiModel: string;
  onModelChange: (model: string) => void;
}

export function ChatInput({
  draft,
  onDraftChange,
  isSending,
  onSubmit,
  textareaRef,
  hasAIApiKey,
  provider,
  onProviderChange,
  model,
  aiModel,
  onModelChange,
}: ChatInputProps) {
  const t = useTranslations("analysisFlow.cvLibrary.chat");

  return (
    <div className="border-t border-line p-3">
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSubmit(e);
            }
          }}
          placeholder={t("inputPlaceholder")}
          rows={1}
          className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-xl border-line bg-panel/[0.03] px-3.5 py-2.5 text-sm text-text-soft placeholder:text-text-faint focus-visible:ring-info-border"
        />
        <AIActionLauncher
          actionLabel={t("sendAction")}
          loading={isSending}
          disabled={isSending || !draft.trim()}
          integrated={{
            available: hasAIApiKey,
            selectedProvider: provider,
            onProviderChange,
            selectedModelId: model || aiModel,
            onModelChange,
            onRun: () => void onSubmit(),
            unavailableReason: t("missingApiKey"),
          }}
          copyPaste={{
            available: false,
            onOpenFlow: () => {},
          }}
        />
      </form>
    </div>
  );
}
