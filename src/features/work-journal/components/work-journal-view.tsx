"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type {
  WorkJournalContextLegacy as WorkJournalContext,
  WorkJournalEntryInputMode,
  WorkJournalEntryLegacy as WorkJournalEntry,
} from "../api/work-journal-types";
import {
  createWorkJournalEntry,
  deleteWorkJournalEntry,
  draftWorkJournalEntry,
  updateWorkJournalEntry,
} from "../api/work-journal-api";
import {
  useWorkJournalContexts,
  useWorkJournalEntries,
} from "../hooks/use-work-journal-queries";
import { workJournalQueryKeys } from "../api/work-journal-query-keys";
import {
  addWorkJournalEntryToCache,
  removeWorkJournalEntryFromCache,
  replaceWorkJournalEntryInCache,
} from "../api/work-journal-entry-cache";
import { getErrorMessage } from "@/lib/errors";
import { WorkJournalTimeline } from "./work-journal-timeline";
import { WorkJournalHeader } from "./work-journal-header";
import { WorkJournalForm } from "./work-journal-form";

interface WorkJournalViewProps {
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyEntryDraft = {
  context_id: "",
  date_start: today(),
  date_end: "",
  topic: "",
  input_mode: "manual" as WorkJournalEntryInputMode,
  raw_notes: "",
  final_text: "",
};

export default function WorkJournalView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
}: WorkJournalViewProps) {
  const t = useTranslations("workJournal");
  const common = useTranslations("common.actions");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const contextsQuery = useWorkJournalContexts();
  const entriesQuery = useWorkJournalEntries();
  const [draft, setDraft] = useState(emptyEntryDraft);
  const [search, setSearch] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [contextFilter, setContextFilter] = useState<string>("");
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(aiModel || "gemini-2.5-flash");
  const formsT = useTranslations("analysisFlow.forms");

  const models = [
    { id: "gemini-2.5-flash", label: `Gemini 2.5 Flash (${formsT("fast")})` },
    { id: "gemini-3.1-pro-preview", label: `Gemini 3.1 Pro Preview (${formsT("powerful")})` },
  ];

  const contexts = contextsQuery.data?.contexts ?? [];
  const entries = entriesQuery.data ?? [];
  const loading = contextsQuery.isLoading || entriesQuery.isLoading;
  const queryError = contextsQuery.error
    ? getErrorMessage(contextsQuery.error)
    : entriesQuery.error
      ? getErrorMessage(entriesQuery.error)
      : null;
  const visibleError = error ?? queryError;
  const activeContexts = contexts.filter((context) => context.status === "active");

  const filteredEntries = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (contextFilter && entry.context_id !== contextFilter) return false;
      if (!needle) return true;
      return [entry.topic, entry.raw_notes, entry.final_text, entry.context?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle));
    });
  }, [contextFilter, entries, search]);

  useEffect(() => {
    const selectedContextId = searchParams.get("activityContextId");
    if (selectedContextId) {
      setDraft((current) => ({ ...current, context_id: selectedContextId }));
      return;
    }
    const defaultContext =
      contexts.find(
        (context) => context.is_default && context.status === "active"
      ) ?? contexts.find((context) => context.status === "active") ?? null;
    if (defaultContext && !draft.context_id) {
      setDraft((current) => ({ ...current, context_id: defaultContext.id }));
    }
  }, [contexts, draft.context_id, searchParams]);

  const openActivityContextManager = () => {
    router.push(
      `/activity-contexts?source=work-journal&returnTo=${encodeURIComponent("/work-journal")}`
    );
  };

  const saveEntry = async () => {
    if (!draft.context_id || !draft.raw_notes.trim()) {
      setError(t("errors.requiredFields"));
      return;
    }

    const finalText =
      draft.input_mode === "manual" ? draft.raw_notes : draft.final_text || draft.raw_notes;
    const previousEntries =
      queryClient.getQueryData<WorkJournalEntry[]>(workJournalQueryKeys.entries()) ?? [];
    const now = new Date().toISOString();
    const optimisticEntry: WorkJournalEntry = {
      id: `optimistic-${now}`,
      user_id: "optimistic",
      context_id: draft.context_id,
      date_start: draft.date_start,
      date_end: draft.date_end || null,
      topic: draft.topic || null,
      input_mode: draft.input_mode,
      raw_notes: draft.raw_notes,
      final_text: finalText,
      metadata: {},
      created_at: now,
      updated_at: now,
      context: contexts.find((context) => context.id === draft.context_id) ?? null,
    };
    queryClient.setQueryData(workJournalQueryKeys.entries(), (current) =>
      addWorkJournalEntryToCache(current as WorkJournalEntry[] | undefined, optimisticEntry)
    );
    setDraft((current) => ({
      ...emptyEntryDraft,
      context_id: current.context_id,
      date_start: today(),
    }));
    setShowForm(false);
    try {
      const entry = await createWorkJournalEntry({
        ...draft,
        final_text: finalText,
        date_end: draft.date_end || null,
        topic: draft.topic || null,
      });
      queryClient.setQueryData(
        workJournalQueryKeys.entries(),
        (current: WorkJournalEntry[] | undefined) =>
          replaceWorkJournalEntryInCache(current, entry).some((item) => item.id === entry.id)
            ? replaceWorkJournalEntryInCache(current, entry)
            : addWorkJournalEntryToCache(
                removeWorkJournalEntryFromCache(current, optimisticEntry.id),
                entry
              )
      );
    } catch (err: unknown) {
      queryClient.setQueryData(workJournalQueryKeys.entries(), previousEntries);
      setError(getErrorMessage(err) || t("errors.saveEntry"));
      setDraft({
        context_id: draft.context_id,
        date_start: draft.date_start,
        date_end: draft.date_end,
        topic: draft.topic,
        input_mode: draft.input_mode,
        raw_notes: draft.raw_notes,
        final_text: draft.final_text,
      });
      setShowForm(true);
    }
  };

  const draftWithAI = async () => {
    if (!hasAIApiKey) {
      onOpenSettings();
      return;
    }
    if (!draft.context_id || !draft.raw_notes.trim()) {
      setError(t("errors.aiDraftRequired"));
      return;
    }

    setAiLoading(true);
    setError(null);
    try {
      const data = await draftWorkJournalEntry({
        provider: aiProvider,
        apiKey: aiApiKey,
        model: selectedModel,
        context_id: draft.context_id,
        date_start: draft.date_start,
        date_end: draft.date_end || null,
        topic: draft.topic || null,
        notes: draft.raw_notes,
      });
      setDraft((current) => ({ ...current, final_text: data.finalText }));
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  const patchEntry = async (
    entry: WorkJournalEntry,
    updates: Partial<WorkJournalEntry>
  ) => {
    const previousEntries =
      queryClient.getQueryData<WorkJournalEntry[]>(workJournalQueryKeys.entries()) ?? [];
    queryClient.setQueryData(
      workJournalQueryKeys.entries(),
      (current: WorkJournalEntry[] | undefined) =>
        replaceWorkJournalEntryInCache(current, {
          ...entry,
          ...updates,
          updated_at: new Date().toISOString(),
        })
    );
    setEditingEntryId(null);
    try {
      const updatedEntry = await updateWorkJournalEntry({ id: entry.id, updates });
      queryClient.setQueryData(
        workJournalQueryKeys.entries(),
        (current: WorkJournalEntry[] | undefined) =>
          replaceWorkJournalEntryInCache(current, updatedEntry)
      );
    } catch (err: unknown) {
      queryClient.setQueryData(workJournalQueryKeys.entries(), previousEntries);
      setEditingEntryId(entry.id);
      setError(getErrorMessage(err) || t("errors.updateEntry"));
    }
  };

  const deleteEntry = async (entry: WorkJournalEntry) => {
    if (!confirm(t("errors.confirmDelete"))) return;
    const previousEntries =
      queryClient.getQueryData<WorkJournalEntry[]>(workJournalQueryKeys.entries()) ?? [];
    queryClient.setQueryData(
      workJournalQueryKeys.entries(),
      (current: WorkJournalEntry[] | undefined) =>
        removeWorkJournalEntryFromCache(current, entry.id)
    );
    try {
      await deleteWorkJournalEntry(entry.id);
    } catch (err: unknown) {
      queryClient.setQueryData(workJournalQueryKeys.entries(), previousEntries);
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-16 lg:px-24 py-12 pb-32">
      <div className="flex flex-col w-full">
        <WorkJournalHeader
          search={search}
          setSearch={setSearch}
          contextFilter={contextFilter}
          setContextFilter={setContextFilter}
          activeContexts={activeContexts}
          showForm={showForm}
          setShowForm={setShowForm}
        />

        {visibleError && (
          <div className="mb-8 text-sm text-rose-400 bg-rose-500/10 px-4 py-3 rounded-lg border border-rose-500/20">
            {visibleError}
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <WorkJournalForm
                draft={draft}
                setDraft={setDraft}
                saveEntry={saveEntry}
                draftWithAI={draftWithAI}
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
            </motion.div>
          )}
        </AnimatePresence>

        <WorkJournalTimeline
          loading={loading}
          filteredEntries={filteredEntries}
          editingEntryId={editingEntryId}
          setEditingEntryId={setEditingEntryId}
          onSave={patchEntry}
          onDelete={deleteEntry}
        />
      </div>
    </div>
  );
}
