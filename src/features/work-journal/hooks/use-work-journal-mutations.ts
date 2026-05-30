"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type {
  WorkJournalEntryInputMode,
  WorkJournalEntryLegacy as WorkJournalEntry,
  WorkJournalContextLegacy as WorkJournalContext,
} from "../api/work-journal-types";
import {
  createWorkJournalEntry,
  deleteWorkJournalEntry,
  draftWorkJournalEntry,
  updateWorkJournalEntry,
} from "../api/work-journal-api";
import { workJournalQueryKeys } from "../api/work-journal-query-keys";
import {
  addWorkJournalEntryToCache,
  removeWorkJournalEntryFromCache,
  replaceWorkJournalEntryInCache,
} from "../api/work-journal-entry-cache";
import { getErrorMessage } from "@/lib/errors";

const today = () => new Date().toISOString().slice(0, 10);

export const emptyEntryDraft = {
  context_id: "",
  date_start: today(),
  date_end: "",
  topic: "",
  input_mode: "manual" as WorkJournalEntryInputMode,
  raw_notes: "",
  final_text: "",
};

export type WorkJournalDraft = typeof emptyEntryDraft;

interface UseWorkJournalMutationsParams {
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  contexts: WorkJournalContext[];
  filteredEntries: WorkJournalEntry[];
  selectedEntryId: string | null;
  setSelectedEntryId: (id: string | null) => void;
  setIsEditing: (editing: boolean) => void;
  setShowForm: (show: boolean) => void;
}

export function useWorkJournalMutations({
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
}: UseWorkJournalMutationsParams) {
  const t = useTranslations("workJournal");
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(emptyEntryDraft);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setSelectedEntryId(optimisticEntry.id);

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
      setSelectedEntryId(entry.id);
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
      setSelectedEntryId(null);
    }
  };

  const draftWithAI = async (selectedModel: string) => {
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

  const draftEditWithAI = async (
    contextId: string,
    dateStart: string,
    dateEnd: string | null,
    topic: string | null,
    notes: string,
    modelId: string
  ): Promise<string> => {
    if (!hasAIApiKey) {
      onOpenSettings();
      throw new Error("Missing API Key");
    }
    const data = await draftWorkJournalEntry({
      provider: aiProvider,
      apiKey: aiApiKey,
      model: modelId,
      context_id: contextId,
      date_start: dateStart,
      date_end: dateEnd,
      topic: topic,
      notes,
    });
    return data.finalText;
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
    setIsEditing(false);
    try {
      const updatedEntry = await updateWorkJournalEntry({ id: entry.id, updates });
      queryClient.setQueryData(
        workJournalQueryKeys.entries(),
        (current: WorkJournalEntry[] | undefined) =>
          replaceWorkJournalEntryInCache(current, updatedEntry)
      );
    } catch (err: unknown) {
      queryClient.setQueryData(workJournalQueryKeys.entries(), previousEntries);
      setIsEditing(true);
      setError(getErrorMessage(err) || t("errors.updateEntry"));
    }
  };

  const deleteEntry = async (entry: WorkJournalEntry) => {
    if (!confirm(t("errors.confirmDelete"))) return;
    const previousEntries =
      queryClient.getQueryData<WorkJournalEntry[]>(workJournalQueryKeys.entries()) ?? [];

    const currentIndex = filteredEntries.findIndex((e) => e.id === entry.id);
    const nextSelection =
      filteredEntries[currentIndex + 1]?.id ??
      filteredEntries[currentIndex - 1]?.id ??
      null;

    queryClient.setQueryData(
      workJournalQueryKeys.entries(),
      (current: WorkJournalEntry[] | undefined) =>
        removeWorkJournalEntryFromCache(current, entry.id)
    );

    if (selectedEntryId === entry.id) {
      setSelectedEntryId(nextSelection);
      setIsEditing(false);
    }

    try {
      await deleteWorkJournalEntry(entry.id);
    } catch (err: unknown) {
      queryClient.setQueryData(workJournalQueryKeys.entries(), previousEntries);
      setError(getErrorMessage(err));
    }
  };

  return {
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
  };
}
