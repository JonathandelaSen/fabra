"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_FAST_GEMINI_MODEL, DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from "@/frontend/ai-models";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { getErrorMessage } from "@/lib/errors";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import {
  useWorkJournalContexts,
  useWorkJournalEntries,
} from "../hooks/use-work-journal-queries";
import { useWorkJournalMutations } from "../hooks/use-work-journal-mutations";
import { WorkJournalSidebar } from "./work-journal-sidebar";
import { WorkJournalDetail } from "./work-journal-detail";
import { WorkJournalForm } from "./work-journal-form";

interface WorkJournalViewProps {
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
}

export default function WorkJournalView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
}: WorkJournalViewProps) {
  const t = useTranslations("workJournal");
  const router = useRouter();
  const searchParams = useSearchParams();
  const contextsQuery = useWorkJournalContexts();
  const entriesQuery = useWorkJournalEntries();

  const [search, setSearch] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [contextFilter, setContextFilter] = useState<string>("");
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(aiModel || DEFAULT_FAST_GEMINI_MODEL);

  const formsT = useTranslations("analysisFlow.forms");
  const models = [
    { id: DEFAULT_FAST_GEMINI_MODEL, label: `${GEMINI_MODELS[DEFAULT_FAST_GEMINI_MODEL]} (${formsT("fast")})` },
    { id: DEFAULT_GEMINI_MODEL, label: `${GEMINI_MODELS[DEFAULT_GEMINI_MODEL]} (${formsT("powerful")})` },
  ];

  const contexts = contextsQuery.data?.contexts ?? [];
  const entries = entriesQuery.data ?? [];
  const loading = contextsQuery.isLoading || entriesQuery.isLoading;
  const queryError = contextsQuery.error
    ? getErrorMessage(contextsQuery.error)
    : entriesQuery.error
      ? getErrorMessage(entriesQuery.error)
      : null;
  const activeContexts = contexts.filter((context) => context.status === "active");

  const filteredEntries = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const sorted = [...entries].sort((a, b) =>
      new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
    );
    return sorted.filter((entry) => {
      if (contextFilter && entry.context_id !== contextFilter) return false;
      if (!needle) return true;
      return [entry.topic, entry.raw_notes, entry.final_text, entry.context?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle));
    });
  }, [contextFilter, entries, search]);

  const {
    draft,
    setDraft,
    aiLoading,
    error,
    setError,
    saveEntry,
    draftWithAI,
    draftEditWithAI,
    patchEntry,
    deleteEntry,
  } = useWorkJournalMutations({
    aiProvider,
    aiApiKey,
    hasAIApiKey,
    onOpenSettings,
    contexts,
    filteredEntries,
    selectedEntryId,
    setSelectedEntryId,
    setIsEditing,
    setShowForm,
  });

  const visibleError = error ?? queryError;

  const selectedEntry = useMemo(() => {
    return entries.find(e => e.id === selectedEntryId) ?? null;
  }, [entries, selectedEntryId]);

  useEffect(() => {
    if (!selectedEntryId && !showForm && filteredEntries.length > 0) {
      setSelectedEntryId(filteredEntries[0].id);
    }
  }, [filteredEntries, selectedEntryId, showForm]);

  useEffect(() => {
    const selectedContextId = searchParams.get("activityContextId");
    if (selectedContextId) {
      setDraft((current) => ({ ...current, context_id: selectedContextId }));
      setShowForm(true);
      setSelectedEntryId(null);
      return;
    }
    const defaultContext =
      contexts.find(
        (context) => context.is_default && context.status === "active"
      ) ?? contexts.find((context) => context.status === "active") ?? null;
    if (defaultContext && !draft.context_id) {
      setDraft((current) => ({ ...current, context_id: defaultContext.id }));
    }
  }, [contexts, draft.context_id, searchParams, setDraft]);

  const openActivityContextManager = () => {
    router.push(
      `/activity-contexts?source=work-journal&returnTo=${encodeURIComponent("/work-journal")}`
    );
  };

  const handleSelectEntry = (id: string) => {
    setSelectedEntryId(id);
    setShowForm(false);
    setIsEditing(false);
    setError(null);
  };

  const handleToggleForm = () => {
    if (showForm) {
      setShowForm(false);
      if (filteredEntries.length > 0 && !selectedEntryId) {
        setSelectedEntryId(filteredEntries[0].id);
      }
    } else {
      setShowForm(true);
      setSelectedEntryId(null);
      setIsEditing(false);
      setError(null);
      const defaultContext = contexts.find((c) => c.is_default && c.status === "active")
        ?? contexts.find((c) => c.status === "active");
      if (defaultContext && !draft.context_id) {
        setDraft((current) => ({ ...current, context_id: defaultContext.id }));
      }
    }
  };

  const handleDraftWithAI = () => draftWithAI(selectedModel);

  return (
    <FeatureScreenShell
      title={t("title")}
      actions={
        <FeatureHeaderActionButton
          label={t("newEntry")}
          onClick={handleToggleForm}
          isActive={showForm}
          cancelLabel={t("close")}
        />
      }
    >
      <FeatureTwoPaneLayout
        sidebar={
          <WorkJournalSidebar
            entries={filteredEntries}
            contexts={contexts}
            selectedId={selectedEntryId}
            isLoading={loading}
            search={search}
            setSearch={setSearch}
            contextFilter={contextFilter}
            setContextFilter={setContextFilter}
            onSelect={handleSelectEntry}
          />
        }
      >
        <div className="flex flex-col gap-4">
          {visibleError && (
            <div className="mb-8 text-sm text-rose-400 bg-rose-500/10 px-4 py-3 rounded-lg border border-rose-500/20">
              {visibleError}
            </div>
          )}

          {showForm ? (
            <div className="px-2 md:px-6 py-4">
              <WorkJournalForm
                draft={draft}
                setDraft={setDraft}
                saveEntry={saveEntry}
                draftWithAI={handleDraftWithAI}
                aiLoading={aiLoading}
                hasAIApiKey={hasAIApiKey}
                onOpenSettings={onOpenSettings}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                models={models}
                isCopyPasteOpen={isCopyPasteOpen}
                setIsCopyPasteOpen={setIsCopyPasteOpen}
                contexts={contexts}
                activeContexts={activeContexts}
                openActivityContextManager={openActivityContextManager}
                setShowForm={setShowForm}
              />
            </div>
          ) : (
            <WorkJournalDetail
              entry={selectedEntry}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onSave={patchEntry}
              onDelete={deleteEntry}
              activeContexts={activeContexts}
              onManageContexts={openActivityContextManager}
              hasAIApiKey={hasAIApiKey}
              onOpenSettings={onOpenSettings}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              models={models}
              onDraftEditWithAI={draftEditWithAI}
            />
          )}
        </div>
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
