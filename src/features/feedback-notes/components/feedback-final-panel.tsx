"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  "w-full resize-y border-indigo-300/10 bg-indigo-300/[0.035] text-sm leading-6 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-indigo-300/40 disabled:cursor-not-allowed disabled:opacity-60";

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
  isEditingMode: boolean;
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
  isEditingMode,
}: FeedbackFinalPanelProps) {
  const t = useTranslations("feedbackNotes");
  const [finalDraft, setFinalDraft] = useState(feedback.finalFeedback ?? "");
  const [finalCopied, setFinalCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(isEditingMode && !feedback.finalFeedback?.trim());
  const hasFinalFeedback = Boolean(feedback.finalFeedback?.trim());

  useEffect(() => {
    setFinalDraft(feedback.finalFeedback ?? "");
    setIsEditing(isEditingMode && !feedback.finalFeedback?.trim());
  }, [feedback.id, feedback.finalFeedback, isEditingMode]);

  const copyFinalFeedback = async () => {
    if (!finalDraft.trim()) return;
    await navigator.clipboard.writeText(finalDraft);
    setFinalCopied(true);
    setTimeout(() => setFinalCopied(false), 2000);
  };

  const cancelEdit = () => {
    setFinalDraft(feedback.finalFeedback ?? "");
    setIsEditing(!feedback.finalFeedback?.trim());
  };

  const saveFinalFeedback = () => {
    onSaveFinalFeedback(finalDraft || null);
    setIsEditing(!finalDraft.trim());
  };

  return (
    <section className="min-w-0 rounded-lg border border-indigo-300/10 bg-[linear-gradient(135deg,rgba(99,102,241,0.08),rgba(255,255,255,0.02)_46%,rgba(16,185,129,0.04))] p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">{t("final.title")}</h2>
          <p className="mt-1 text-xs text-zinc-500">{t("final.description")}</p>
        </div>
      </div>
      <label htmlFor="feedback-final-draft" className="sr-only">
        {t("final.title")}
      </label>
      {isEditingMode && isEditing && !isClosed ? (
        <Textarea
          id="feedback-final-draft"
          value={finalDraft}
          onChange={(event) => setFinalDraft(event.target.value)}
          placeholder={t("final.placeholder")}
          rows={14}
          className={textareaClass}
        />
      ) : hasFinalFeedback ? (
        <div className="min-h-[18rem] rounded-lg border border-indigo-300/10 bg-[#101018]/90 px-3 py-3 text-sm leading-6 text-zinc-200">
          <p className="whitespace-pre-wrap">{feedback.finalFeedback}</p>
        </div>
      ) : (
        <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-lg border border-dashed border-indigo-300/15 bg-[#101018]/60 px-4 py-8 text-center">
          <p className="text-sm font-medium text-zinc-500">{t("final.empty")}</p>
          {!isClosed && !isEditingMode && (
            <p className="mt-2 text-xs text-zinc-600">
              {t("final.emptyHint")}
            </p>
          )}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!isClosed && isEditingMode && isEditing && (
          <Button
            type="button"
            onClick={saveFinalFeedback}
            disabled={isSaving}
            variant="secondary"
          >
            <Save className="h-4 w-4" />
            {t("final.save")}
          </Button>
        )}
        {!isClosed && isEditingMode && isEditing && hasFinalFeedback && (
          <Button type="button" onClick={cancelEdit} variant="ghost">
            <X className="h-4 w-4" />
            {t("actions.cancel")}
          </Button>
        )}
        {!isClosed && isEditingMode && !isEditing && (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            variant="secondary"
          >
            <Pencil className="h-4 w-4" />
            {t("actions.edit")}
          </Button>
        )}
        <Button
          type="button"
          onClick={() => void copyFinalFeedback()}
          disabled={!finalDraft.trim()}
          variant="secondary"
          className="hover:border-indigo-300/25 hover:bg-indigo-300/10 hover:text-zinc-50"
        >
          {finalCopied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {finalCopied ? t("final.copied") : t("final.copy")}
        </Button>
        {!isClosed && isEditingMode && (
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
    </section>
  );
}
