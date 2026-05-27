"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { useFeedbackNotesMutations } from "../hooks/use-feedback-notes-mutations";
import {
  useFeedbackEntries,
  useFeedbackNoteDetail,
  useFeedbackNotesList,
} from "../hooks/use-feedback-notes-queries";
import { useFeedbackNotesRouteState } from "../hooks/use-feedback-notes-route-state";
import { useActivityContexts } from "@/features/activity-context";
import { FeedbackNotesDetailSkeleton } from "./feedback-notes-skeleton";
import { FeedbackNotesDetail } from "./feedback-notes-detail";
import { FeedbackNotesSidebar } from "./feedback-notes-sidebar";
import { FeedbackCopyPastePanel } from "./feedback-copy-paste-panel";

interface FeedbackNotesViewProps {
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings?: () => void;
}

export default function FeedbackNotesView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
}: FeedbackNotesViewProps) {
  const t = useTranslations("feedbackNotes");
  const routeState = useFeedbackNotesRouteState();
  const {
    clearSelection,
    feedbackId,
    replaceFeedback,
    selectFeedback,
    setStatus,
    status,
  } = routeState;
  const listQuery = useFeedbackNotesList(status);
  const detailQuery = useFeedbackNoteDetail(feedbackId);
  const entriesQuery = useFeedbackEntries(feedbackId);
  const contextsQuery = useActivityContexts();
  const mutations = useFeedbackNotesMutations(status);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-3.1-pro-preview");
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);
  const [deletingEntryIds, setDeletingEntryIds] = useState<Set<string>>(new Set());

  const feedbacks = listQuery.data ?? [];
  const listSelectedFeedback =
    feedbacks.find((feedback) => feedback.id === feedbackId) ?? null;
  const selectedFeedback = detailQuery.data ?? listSelectedFeedback;
  const entries = entriesQuery.data ?? [];
  const selectedIdInCurrentList = listSelectedFeedback?.id ?? null;
  const isInitialListLoading = listQuery.isLoading && feedbacks.length === 0;

  const isSaving = useMemo(
    () =>
      mutations.createFeedback.isPending ||
      mutations.updateFeedback.isPending ||
      mutations.deleteFeedback.isPending ||
      mutations.closeFeedback.isPending ||
      mutations.reopenFeedback.isPending ||
      mutations.createEntry.isPending ||
      mutations.updateEntry.isPending,
    [mutations]
  );

  useEffect(() => {
    if (!feedbackId && feedbacks[0]?.id) {
      replaceFeedback(feedbacks[0].id);
    }
  }, [feedbackId, feedbacks, replaceFeedback]);

  useEffect(() => {
    const queryError = listQuery.error ?? detailQuery.error ?? entriesQuery.error;
    if (queryError) setError(getErrorMessage(queryError));
  }, [detailQuery.error, entriesQuery.error, listQuery.error]);

  const runMutation = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleApplyCopyPasteText = (text: string) => {
    if (!selectedFeedback) return;
    void runMutation(() =>
      mutations.updateFeedback.mutateAsync({
        feedbackId: selectedFeedback.id,
        updates: { finalFeedback: text },
      })
    );
  };

  return (
    <FeatureScreenShell
      title={t("title")}
      contentClassName="max-w-[1560px] mx-auto"
      bodyContentClassName="max-w-[1560px] mx-auto"
    >
      <FeatureTwoPaneLayout
        sidebar={
          <FeedbackNotesSidebar
            feedbacks={feedbacks}
            contexts={contextsQuery.data?.contexts ?? []}
            selectedId={selectedIdInCurrentList}
            status={status}
            isLoading={isInitialListLoading}
            isCreating={mutations.createFeedback.isPending}
            onStatusChange={setStatus}
            onSelect={selectFeedback}
            onCreate={(personName, activityContextId) =>
              void runMutation(async () => {
                const feedback = await mutations.createFeedback.mutateAsync({
                  personName,
                  activityContextId,
                });
                replaceFeedback(feedback.id);
              })
            }
          />
        }
      >
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}

        {isInitialListLoading || (feedbackId && detailQuery.isLoading) ? (
          <FeedbackNotesDetailSkeleton />
        ) : !selectedFeedback ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            {t("emptySelection")}
          </div>
        ) : (
          <FeedbackNotesDetail
            feedback={selectedFeedback}
            entries={entries}
            contexts={contextsQuery.data?.contexts ?? []}
            deletingEntryIds={deletingEntryIds}
            isSaving={isSaving}
            isGenerating={mutations.generateFinalFeedback.isPending}
            hasAIApiKey={hasAIApiKey}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onUpdateFeedback={(updates) =>
              void runMutation(() =>
                mutations.updateFeedback.mutateAsync({
                  feedbackId: selectedFeedback.id,
                  updates,
                })
              )
            }
            onDeleteFeedback={() =>
              void runMutation(async () => {
                if (!confirm(t("confirmDeleteFeedback"))) return;
                await mutations.deleteFeedback.mutateAsync(selectedFeedback.id);
                clearSelection();
              })
            }
            onCloseFeedback={() =>
              void runMutation(() => mutations.closeFeedback.mutateAsync(selectedFeedback.id))
            }
            onReopenFeedback={() =>
              void runMutation(() => mutations.reopenFeedback.mutateAsync(selectedFeedback.id))
            }
            onCreateEntry={(content) =>
              void runMutation(() =>
                mutations.createEntry.mutateAsync({
                  feedbackId: selectedFeedback.id,
                  content,
                })
              )
            }
            onUpdateEntry={(entryId, content) =>
              void runMutation(() => mutations.updateEntry.mutateAsync({ entryId, content }))
            }
            onDeleteEntry={(entryId) =>
              void runMutation(async () => {
                if (!confirm(t("confirmDeleteEntry"))) return;
                setDeletingEntryIds((prev) => new Set(prev).add(entryId));
                try {
                  await mutations.deleteEntry.mutateAsync({
                    entryId,
                    feedbackId: selectedFeedback.id,
                  });
                } finally {
                  setDeletingEntryIds((prev) => {
                    const next = new Set(prev);
                    next.delete(entryId);
                    return next;
                  });
                }
              })
            }
            onGenerate={() =>
              void runMutation(async () => {
                if (!hasAIApiKey) {
                   onOpenSettings?.();
                  return;
                }
                if (entries.length === 0) {
                  setError(t("errors.entriesRequiredForGeneration"));
                  return;
                }
                if (
                  selectedFeedback.finalFeedback?.trim() &&
                  !confirm(t("confirmReplaceFinalFeedback"))
                ) {
                  return;
                }
                await mutations.generateFinalFeedback.mutateAsync({
                  feedbackId: selectedFeedback.id,
                  provider: aiProvider,
                  apiKey: aiApiKey,
                  model: aiModel,
                });
              })
            }
            onOpenCopyPaste={() => setIsCopyPasteOpen(true)}
            onOpenSettings={onOpenSettings}
          />
        )}
      </FeatureTwoPaneLayout>

      {isCopyPasteOpen && selectedFeedback && (
        <FeedbackCopyPastePanel
          feedback={selectedFeedback}
          entries={entries}
          onApplyText={handleApplyCopyPasteText}
          onClose={() => setIsCopyPasteOpen(false)}
        />
      )}
    </FeatureScreenShell>
  );
}
