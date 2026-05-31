"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { WorkJournalContextLegacy as WorkJournalContext, WorkJournalEntryLegacy as WorkJournalEntry } from "../api/work-journal-types";
import { ActivityContextSelector } from "@/features/activity-context";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { getErrorMessage } from "@/lib/errors";
import { BasicPanel } from "@/components/shared/basic-panel";
import type { StoredAIProvider } from "@/lib/browser-preferences";

interface WorkJournalEntryEditorProps {
  entry: WorkJournalEntry;
  onSave: (updates: Partial<WorkJournalEntry>) => void;
  onCancel: () => void;
  activeContexts: WorkJournalContext[];
  onManageContexts: () => void;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  selectedProvider: StoredAIProvider;
  setSelectedProvider: (provider: StoredAIProvider) => void;
  selectedModel: string;
  setSelectedModel: (s: string) => void;
  onDraftEditWithAI: (
    contextId: string,
    dateStart: string,
    dateEnd: string | null,
    topic: string | null,
    notes: string,
    provider: StoredAIProvider,
    modelId: string
  ) => Promise<string>;
}

export function WorkJournalEntryEditor({
  entry,
  onSave,
  onCancel,
  activeContexts,
  onManageContexts,
  hasAIApiKey,
  onOpenSettings,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  onDraftEditWithAI,
}: WorkJournalEntryEditorProps) {
  const t = useTranslations("workJournal");
  const common = useTranslations("common.actions");
  const [edit, setEdit] = useState(entry);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!edit.context_id || !edit.raw_notes.trim()) {
      setError(t("errors.aiDraftRequired"));
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const newText = await onDraftEditWithAI(
        edit.context_id,
        edit.date_start,
        edit.date_end,
        edit.topic,
        edit.raw_notes,
        selectedProvider,
        selectedModel
      );
      setEdit((current) => ({ ...current, final_text: newText }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="group text-left">
      <BasicPanel className="space-y-6 w-full p-6 md:p-8">
        <div className="flex flex-wrap gap-4 items-start">
          <div className="w-full sm:w-auto min-w-[240px] mb-2 sm:mb-0">
            <ActivityContextSelector
              id="edit-entry-context"
              manageLabel={t("manageContexts")}
              value={edit.context_id || ""}
              onChange={(val) => setEdit({ ...edit, context_id: val })}
              contexts={activeContexts}
              onManageClick={onManageContexts}
            />
          </div>
          <div className="flex flex-wrap gap-4 flex-1 items-end">
            <input
              type="date"
              className="bg-transparent border-b border-zinc-700 text-sm text-zinc-200 outline-none pb-1"
              value={edit.date_start}
              onChange={(e) => setEdit({ ...edit, date_start: e.target.value })}
            />
            <input
              type="date"
              className="bg-transparent border-b border-zinc-700 text-sm text-zinc-200 outline-none pb-1"
              value={edit.date_end || ""}
              onChange={(e) =>
                setEdit({ ...edit, date_end: e.target.value || null })
              }
            />
            <input
              placeholder={t("editTopicPlaceholder")}
              className="bg-transparent border-b border-zinc-700 text-sm text-zinc-200 outline-none pb-1 flex-1 min-w-[200px]"
              value={edit.topic || ""}
              onChange={(e) =>
                setEdit({ ...edit, topic: e.target.value || null })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block">
              {t("finalText")}
            </label>
            <textarea
              className="w-full bg-transparent text-[17px] md:text-lg font-light leading-relaxed text-zinc-200 placeholder:text-zinc-700 outline-none resize-y min-h-[240px] border border-white/10 rounded-xl p-4 focus:border-white/20 transition-colors"
              value={edit.final_text}
              onChange={(event) =>
                setEdit({ ...edit, final_text: event.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block">
              {t("rawNotes")}
            </label>
            <textarea
              className="w-full bg-transparent text-[15px] font-light leading-relaxed text-zinc-400 placeholder:text-zinc-700 outline-none resize-y min-h-[120px] border border-white/5 rounded-xl p-4 focus:border-white/20 transition-colors"
              value={edit.raw_notes}
              onChange={(event) =>
                setEdit({ ...edit, raw_notes: event.target.value })
              }
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-rose-400 bg-rose-500/10 px-4 py-3 rounded-lg border border-rose-500/20">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onSave(edit)}
            disabled={aiLoading}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("saveChanges")}
          </button>
          <button
            onClick={onCancel}
            disabled={aiLoading}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {common("cancel")}
          </button>

          <div className="ml-auto">
            <AIActionLauncher
              actionLabel={t("generateProfessionalDraft")}
              loading={aiLoading}
              disabled={!edit.raw_notes.trim() || !edit.context_id}
              integrated={{
                available: hasAIApiKey,
                selectedProvider,
                onProviderChange: setSelectedProvider,
                selectedModelId: selectedModel,
                onModelChange: setSelectedModel,
                onRun: handleGenerate,
                onConfigure: onOpenSettings,
              }}
              copyPaste={{
                available: false, // Omitted for simplicity in edit mode
                onOpenFlow: () => {},
              }}
            />
          </div>
        </div>
      </BasicPanel>
    </div>
  );
}
