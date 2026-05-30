"use client";

import { FormEvent, RefObject } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_GEMINI_MODEL, DEFAULT_FAST_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";
import { Textarea } from "@/components/ui/textarea";
import AIActionLauncher from "@/components/shared/ai-action-launcher";

interface ChatInputProps {
  draft: string;
  onDraftChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  isSending: boolean;
  isPreparingCopyPaste: boolean;
  hasAIApiKey: boolean;
  model: string;
  aiModel: string;
  onModelChange: (model: string) => void;
  onSubmit: (event?: FormEvent) => void;
  onOpenCopyPasteFlow: () => void;
}

export function ChatInput({
  draft,
  onDraftChange,
  textareaRef,
  isSending,
  isPreparingCopyPaste,
  hasAIApiKey,
  model,
  aiModel,
  onModelChange,
  onSubmit,
  onOpenCopyPasteFlow,
}: ChatInputProps) {
  const t = useTranslations("analysisDetail.chat");

  return (
    <div className="border-t border-white/[0.06] p-3">
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
          className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-xl border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-cyan-500/20"
        />
        <AIActionLauncher
          actionLabel={t("sendAction")}
          loading={isSending || isPreparingCopyPaste}
          disabled={!draft.trim()}
          integrated={{
            available: hasAIApiKey,
            selectedModelId: model || aiModel,
            models: [
              { id: DEFAULT_GEMINI_MODEL, label: GEMINI_MODELS[DEFAULT_GEMINI_MODEL] },
              { id: DEFAULT_FAST_GEMINI_MODEL, label: GEMINI_MODELS[DEFAULT_FAST_GEMINI_MODEL] },
            ],
            onModelChange,
            onRun: () => void onSubmit(),
            unavailableReason: t("missingApiKey"),
          }}
          copyPaste={{
            available: true,
            onOpenFlow: onOpenCopyPasteFlow,
          }}
        />
      </form>
    </div>
  );
}
