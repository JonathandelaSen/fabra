"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
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
import {
  shouldAutoSelectFeedbackNote,
  shouldShowFeedbackNotesContentLoader,
} from "./feedback-notes-loading-state";
import { FeedbackNotesSidebar } from "./feedback-notes-sidebar";
import { FeedbackCopyPastePanel } from "./feedback-copy-paste-panel";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";

import { getAIRequestConfigForProvider, type StoredAIProvider } from "@/lib/browser-preferences";

interface FeedbackNotesViewProps {
  aiProvider: StoredAIProvider;
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
    pathname,
    replaceFeedback,
    selectFeedback,
    setStatus,
    status,
  } = routeState;
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(feedbackId);

  useEffect(() => {
    setSelectedFeedbackId(feedbackId);
  }, [feedbackId]);

  const listQuery = useFeedbackNotesList(status);
  const detailQuery = useFeedbackNoteDetail(selectedFeedbackId);
  const entriesQuery = useFeedbackEntries(selectedFeedbackId);
  const contextsQuery = useActivityContexts();
  const mutations = useFeedbackNotesMutations(status);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<StoredAIProvider>("gemini");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<string | null>(null);
  const [deletingEntryIds, setDeletingEntryIds] = useState<Set<string>>(new Set());

  const feedbacks = listQuery.data ?? [];
  const listSelectedFeedback =
    feedbacks.find((feedback) => feedback.id === selectedFeedbackId) ?? null;
  const selectedFeedback = detailQuery.data ?? listSelectedFeedback;
  const entries = entriesQuery.data ?? [];
  const selectedIdInCurrentList = listSelectedFeedback?.id ?? null;
  const isListPending = listQuery.isPending;
  const isDetailPending = detailQuery.isPending;
  const isInitialListLoading = isListPending && feedbacks.length === 0;

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
    if (
      shouldAutoSelectFeedbackNote({
        feedbackCount: feedbacks.length,
        isListPending,
        pathname,
        selectedFeedbackId: feedbackId,
      }) &&
      feedbacks[0]?.id
    ) {
      setSelectedFeedbackId(feedbacks[0].id);
      replaceFeedback(feedbacks[0].id);
    }
  }, [feedbackId, feedbacks, isListPending, pathname, replaceFeedback]);

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
    setPendingDraft(text);
  };

  return (
    <FeatureScreenShell
      title={t("title")}
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
            onSelect={(id) => {
              setSelectedFeedbackId(id);
              selectFeedback(id);
            }}
            onCreate={(personName, activityContextId) =>
              void runMutation(async () => {
                const feedback = await mutations.createFeedback.mutateAsync({
                  personName,
                  activityContextId,
                });
                setSelectedFeedbackId(feedback.id);
                replaceFeedback(feedback.id);
              })
            }
          />
        }
      >
        {error && (
          <AlertBanner tone={ALERT_BANNER_TONES.DANGER} className="mb-4">
            {error}
          </AlertBanner>
        )}

        {shouldShowFeedbackNotesContentLoader({
          feedbackCount: feedbacks.length,
          isDetailPending,
          isListPending,
          pathname,
          selectedFeedbackId,
        }) ? (
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
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
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
                setSelectedFeedbackId(null);
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
                const resolvedProvider = selectedProvider || aiProvider;
                const aiConfig = getAIRequestConfigForProvider(resolvedProvider, aiApiKey, selectedModel || aiModel);
                if (aiConfig.error) {
                  setError(aiConfig.error);
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
                  provider: aiConfig.provider,
                  apiKey: aiConfig.apiKey,
                  baseUrl: aiConfig.baseUrl,
                  model: aiConfig.model,
                });
              })
            }
            onOpenCopyPaste={() => setIsCopyPasteOpen(true)}
            onOpenSettings={onOpenSettings}
            pendingDraft={pendingDraft}
            onPendingDraftConsumed={() => setPendingDraft(null)}
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
