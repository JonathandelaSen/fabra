"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Archive, Check, Pencil, RefreshCw, Save, Trash2 } from "lucide-react";
import { LabelBadge, LABEL_BADGE_TONES } from "@/components/shared/label-badge";
import type { FeedbackEntry, FeedbackListItem } from "../api/feedback-notes-api";
import { ActivityContextSelector, type ActivityContext } from "@/features/activity-context";
import { FeedbackEntriesPanel } from "./feedback-entries-panel";
import { FeedbackFinalPanel } from "./feedback-final-panel";
import {
  EditButton,
  DeleteButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { BasicPanel } from "@/components/shared/basic-panel";
import type { StoredAIProvider } from "@/lib/browser-preferences";

interface FeedbackNotesDetailProps {
  feedback: FeedbackListItem;
  entries: FeedbackEntry[];
  contexts: ActivityContext[];
  deletingEntryIds: Set<string>;
  isSaving: boolean;
  isGenerating: boolean;
  hasAIApiKey: boolean;
  selectedProvider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onUpdateFeedback: (
    updates: {
      personName?: string;
      finalFeedback?: string | null;
      activityContextId?: string;
    }
  ) => void;
  onDeleteFeedback: () => void;
  onCloseFeedback: () => void;
  onReopenFeedback: () => void;
  onCreateEntry: (content: string) => void;
  onUpdateEntry: (entryId: string, content: string) => void;
  onDeleteEntry: (entryId: string) => void;
  onGenerate: () => void;
  onOpenCopyPaste: () => void;
  onOpenSettings?: () => void;
  pendingDraft?: string | null;
  onPendingDraftConsumed?: () => void;
}

export function FeedbackNotesDetail({
  feedback,
  entries,
  contexts,
  deletingEntryIds,
  isSaving,
  isGenerating,
  onUpdateFeedback,
  onDeleteFeedback,
  onCloseFeedback,
  onReopenFeedback,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
  onGenerate,
  onOpenCopyPaste,
  onOpenSettings,
  hasAIApiKey,
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
  pendingDraft,
  onPendingDraftConsumed,
}: FeedbackNotesDetailProps) {
  const t = useTranslations("feedbackNotes");
  const router = useRouter();
  const [personNameDraft, setPersonNameDraft] = useState(feedback.personName);
  const [isEditing, setIsEditing] = useState(false);
  const isClosed = feedback.status === "closed";

  useEffect(() => {
    setPersonNameDraft(feedback.personName);
    setIsEditing(false);
  }, [feedback.id, feedback.personName]);

  return (
    <div className="flex w-full max-w-[1600px] mx-auto flex-col gap-5">
      <BasicPanel as="section" className="p-3 sm:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            {!isClosed && isEditing ? (
              <div className="flex flex-col gap-4">
                <div className="min-w-0">
                  <label
                    htmlFor="feedback-detail-person-name"
                    className="mb-1.5 block text-xs font-medium text-text-muted"
                  >
                    {t("fields.personName")}
                  </label>
                  <input
                    id="feedback-detail-person-name"
                    value={personNameDraft}
                    onChange={(event) => setPersonNameDraft(event.target.value)}
                    onInput={(event) => setPersonNameDraft(event.currentTarget.value)}
                    className="h-auto w-full border-b border-line/10 bg-transparent px-0 py-0.5 text-3xl font-semibold tracking-tight text-text-main outline-none transition-colors focus:border-action-border focus:text-text-main"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <ActivityContextSelector
                    id="feedback-detail-context"
                    label={t("fields.activityContext")}
                    manageLabel={t("actions.manageContexts")}
                    value={feedback.activityContextId}
                    onChange={(val) => onUpdateFeedback({ activityContextId: val })}
                    contexts={contexts}
                    onManageClick={() =>
                      router.push(
                        `/activity-contexts?source=feedback-notes&returnTo=${encodeURIComponent(
                          "/feedback-notes"
                        )}`
                      )
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <h2 className="py-1 text-3xl font-semibold tracking-tight text-text-main min-h-[2.5rem] flex items-center">
                  {feedback.personName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  {isClosed && (
                    <LabelBadge
                      label={t(`status.${feedback.status}`)}
                      tone={LABEL_BADGE_TONES.NEUTRAL}
                    />
                  )}
                  <LabelBadge
                    label={contexts.find((c) => c.id === feedback.activityContextId)?.name || t("fields.activityContext")}
                    tone={LABEL_BADGE_TONES.INDIGO}
                  />
                  <span className="text-text-faint">•</span>
                  <span>
                    {t("updated", { date: formatDate(feedback.updatedAt) })}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {!isClosed && isEditing && personNameDraft !== feedback.personName && (
              <IconTextButton
                type="button"
                onClick={() => onUpdateFeedback({ personName: personNameDraft })}
                icon={Save}
                tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
              >
                {t("actions.saveName")}
              </IconTextButton>
            )}
            {!isClosed && (
              isEditing ? (
                <IconTextButton
                  type="button"
                  icon={Check}
                  tone={ICON_TEXT_BUTTON_TONES.SUCCESS}
                  onClick={() => {
                    if (personNameDraft.trim() !== feedback.personName) {
                      onUpdateFeedback({ personName: personNameDraft });
                    }
                    setIsEditing(false);
                  }}
                >
                  {t("actions.viewMode")}
                </IconTextButton>
              ) : (
                <EditButton
                  aria-label={t("actions.edit")}
                  onClick={() => setIsEditing(true)}
                />
              )
            )}
            {isClosed ? (
              <IconTextButton
                type="button"
                onClick={onReopenFeedback}
                icon={RefreshCw}
              >
                {t("actions.reopen")}
              </IconTextButton>
            ) : (
              <IconTextButton
                type="button"
                onClick={onCloseFeedback}
                icon={Archive}
              >
                {t("actions.close")}
              </IconTextButton>
            )}
            <DeleteButton
              onClick={onDeleteFeedback}
            />
          </div>
        </div>
      </BasicPanel>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,440px)]">
        <FeedbackEntriesPanel
          entries={entries}
          isClosed={isClosed}
          isSaving={isSaving}
          deletingEntryIds={deletingEntryIds}
          onCreateEntry={onCreateEntry}
          onUpdateEntry={onUpdateEntry}
          onDeleteEntry={onDeleteEntry}
          isEditingMode={isEditing}
        />
        <FeedbackFinalPanel
          feedback={feedback}
          entries={entries}
          isClosed={isClosed}
          isSaving={isSaving}
          isGenerating={isGenerating}
          hasAIApiKey={hasAIApiKey}
          selectedProvider={selectedProvider}
          onProviderChange={onProviderChange}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onSaveFinalFeedback={(finalFeedback) => onUpdateFeedback({ finalFeedback })}
          onGenerate={onGenerate}
          onOpenCopyPaste={onOpenCopyPaste}
          onOpenSettings={onOpenSettings}
          isEditingMode={isEditing}
          pendingDraft={pendingDraft}
          onPendingDraftConsumed={onPendingDraftConsumed}
        />
      </section>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
