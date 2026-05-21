"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Save } from "lucide-react";
import AIActionLauncher, {
  type AIModelOption,
} from "@/components/shared/ai-action-launcher";
import type { FeedbackEntry, FeedbackListItem } from "../api/feedback-notes-api";

const AI_MODELS: AIModelOption[] = [
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview" },
  { id: "gemini-3.1-flash-preview", label: "Gemini 3.1 Flash Preview" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

const textareaClass =
  "w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-300 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60";

interface FeedbackFinalPanelProps {
  feedback: FeedbackListItem;
  entries: FeedbackEntry[];
  isClosed: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  hasAIApiKey: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSaveFinalFeedback: (finalFeedback: string | null) => void;
  onGenerate: () => void;
  onOpenCopyPaste: () => void;
  onOpenSettings?: () => void;
}

export function FeedbackFinalPanel({
  feedback,
  entries,
  isClosed,
  isSaving,
  isGenerating,
  hasAIApiKey,
  selectedModel,
  onModelChange,
  onSaveFinalFeedback,
  onGenerate,
  onOpenCopyPaste,
  onOpenSettings,
}: FeedbackFinalPanelProps) {
  const t = useTranslations("feedbackNotes");
  const [finalDraft, setFinalDraft] = useState(feedback.finalFeedback ?? "");
  const [finalCopied, setFinalCopied] = useState(false);

  useEffect(() => {
    setFinalDraft(feedback.finalFeedback ?? "");
  }, [feedback.id, feedback.finalFeedback]);

  const copyFinalFeedback = async () => {
    if (!finalDraft.trim()) return;
    await navigator.clipboard.writeText(finalDraft);
    setFinalCopied(true);
    setTimeout(() => setFinalCopied(false), 2000);
  };

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-200">{t("final.title")}</h2>
      </div>
      <textarea
        value={finalDraft}
        onChange={(event) => setFinalDraft(event.target.value)}
        disabled={isClosed}
        placeholder={t("final.placeholder")}
        rows={14}
        className={textareaClass}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!isClosed && (
          <button
            type="button"
            onClick={() => onSaveFinalFeedback(finalDraft || null)}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/[0.12] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {t("final.save")}
          </button>
        )}
        <button
          type="button"
          onClick={() => void copyFinalFeedback()}
          disabled={!finalDraft.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/[0.08] px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/[0.12] disabled:opacity-50"
        >
          {finalCopied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {finalCopied ? t("final.copied") : t("final.copy")}
        </button>
        {!isClosed && (
          <AIActionLauncher
            actionLabel={t("final.generate")}
            loading={isGenerating}
            disabled={entries.length === 0}
            integrated={{
              available: hasAIApiKey,
              selectedModelId: selectedModel,
              models: AI_MODELS,
              onModelChange,
              onRun: onGenerate,
              onConfigure: onOpenSettings,
            }}
            copyPaste={{
              available: true,
              onOpenFlow: onOpenCopyPaste,
            }}
          />
        )}
      </div>
    </div>
  );
}

