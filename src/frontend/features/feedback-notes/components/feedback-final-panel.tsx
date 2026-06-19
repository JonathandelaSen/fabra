"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { copyToClipboard } from "@/lib/clipboard";
import { Check, Copy, Pencil, Save, X } from "lucide-react";
import { Textarea } from "@/frontend/components/ui/textarea";
import AIActionLauncher from "@/frontend/components/shared/ai-action-launcher";
import { EditButton, IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/frontend/components/shared/action-buttons";
import type { FeedbackEntry, FeedbackListItem } from "../api/feedback-notes-api";
import type { StoredAIProvider } from "@/lib/browser-preferences";

const textareaClass =
  "w-full resize-y border-action-border bg-action/[0.035] text-sm leading-6 text-text-main placeholder:text-text-faint focus-visible:border-action-border disabled:cursor-not-allowed disabled:opacity-60";

interface FeedbackFinalPanelProps {
  feedback: FeedbackListItem;
  entries: FeedbackEntry[];
  isClosed: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  hasAIApiKey: boolean;
  selectedProvider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSaveFinalFeedback: (finalFeedback: string | null) => void;
  onGenerate: () => void;
  onOpenCopyPaste: () => void;
  onOpenSettings?: () => void;
  isEditingMode: boolean;
  pendingDraft?: string | null;
  onPendingDraftConsumed?: () => void;
}

export function FeedbackFinalPanel({
  feedback,
  entries,
  isClosed,
  isSaving,
  isGenerating,
  hasAIApiKey,
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
  onSaveFinalFeedback,
  onGenerate,
  onOpenCopyPaste,
  onOpenSettings,
  isEditingMode,
  pendingDraft,
  onPendingDraftConsumed,
}: FeedbackFinalPanelProps) {
  const t = useTranslations("feedbackNotes");
  const [finalDraft, setFinalDraft] = useState(feedback.finalFeedback ?? "");
  const [finalCopied, setFinalCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(isEditingMode && !feedback.finalFeedback?.trim());
  const hasFinalFeedback = Boolean(feedback.finalFeedback?.trim());

  useEffect(() => {
    setFinalDraft(feedback.finalFeedback ?? "");
  }, [feedback.finalFeedback]);

  useEffect(() => {
    setIsEditing(isEditingMode && !feedback.finalFeedback?.trim());
  }, [feedback.id, isEditingMode]);

  useEffect(() => {
    if (pendingDraft) {
      setFinalDraft(pendingDraft);
      setIsEditing(true);
      onPendingDraftConsumed?.();
    }
  }, [pendingDraft, onPendingDraftConsumed]);

  const copyFinalFeedback = async () => {
    if (!finalDraft.trim()) return;
    await copyToClipboard(finalDraft);
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
    <section className="relative min-w-0 rounded-lg border border-action-border/15 bg-[image:var(--ui-feedback-panel-bg)] shadow-[var(--ui-action-glow-shadow)] p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-main">{t("final.title")}</h2>
          <p className="mt-1 text-xs text-text-muted">{t("final.description")}</p>
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
        <div className="min-h-[18rem] rounded-lg border border-line bg-panel-elevated px-3 py-3 text-sm leading-6 text-text-on-bright">
          <p className="whitespace-pre-wrap">{feedback.finalFeedback}</p>
        </div>
      ) : (
        <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-lg border border-dashed border-line bg-panel-subtle px-4 py-8 text-center">
          <p className="text-sm font-medium text-text-muted">{t("final.empty")}</p>
          {!isClosed && !isEditingMode && (
            <p className="mt-2 text-xs text-text-faint">
              {t("final.emptyHint")}
            </p>
          )}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!isClosed && isEditingMode && isEditing && (
          <IconTextButton
            icon={Save}
            tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
            onClick={saveFinalFeedback}
            disabled={isSaving}
          >
            {t("final.save")}
          </IconTextButton>
        )}
        {!isClosed && isEditingMode && isEditing && hasFinalFeedback && (
          <IconTextButton icon={X} onClick={cancelEdit}>
            {t("actions.cancel")}
          </IconTextButton>
        )}
        {!isClosed && isEditingMode && !isEditing && (
          <EditButton
            aria-label={t("actions.edit")}
            onClick={() => setIsEditing(true)}
          />
        )}
        <IconTextButton
          icon={finalCopied ? Check : Copy}
          tone={finalCopied ? ICON_TEXT_BUTTON_TONES.SUCCESS : ICON_TEXT_BUTTON_TONES.DEFAULT}
          onClick={() => void copyFinalFeedback()}
          disabled={!finalDraft.trim()}
        >
          {finalCopied ? t("final.copied") : t("final.copy")}
        </IconTextButton>
        {!isClosed && isEditingMode && (
          <AIActionLauncher
            actionLabel={t("final.generate")}
            loading={isGenerating}
            disabled={entries.length === 0}
            integrated={{
              available: hasAIApiKey,
              selectedProvider,
              onProviderChange,
              selectedModelId: selectedModel,
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
