"use client";

import { useTranslations } from "next-intl";
import type {

  WorkJournalContextLegacy as WorkJournalContext,
  WorkJournalEntryInputMode,
} from "../api/work-journal-types";
import { WorkJournalInputModeTabs } from "./work-journal-input-mode-tabs";
import { WorkJournalAISection } from "./work-journal-ai-section";
import { WorkJournalFormActions } from "./work-journal-form-actions";
import { WorkJournalFormMetadata } from "./work-journal-form-metadata";

interface WorkJournalFormProps {
  draft: {
    context_id: string;
    date_start: string;
    date_end: string;
    topic: string;
    input_mode: WorkJournalEntryInputMode;
    raw_notes: string;
    final_text: string;
  };
  setDraft: React.Dispatch<React.SetStateAction<{
    context_id: string;
    date_start: string;
    date_end: string;
    topic: string;
    input_mode: WorkJournalEntryInputMode;
    raw_notes: string;
    final_text: string;
  }>>;
  saveEntry: () => Promise<void>;
  draftWithAI: () => Promise<void>;
  aiLoading: boolean;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  selectedModel: string;
  setSelectedModel: (s: string) => void;
  models: { id: string; label: string }[];
  isCopyPasteOpen: boolean;
  setIsCopyPasteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  contexts: WorkJournalContext[];
  activeContexts: WorkJournalContext[];
  openActivityContextManager: () => void;
  setShowForm: (b: boolean) => void;
}

export function WorkJournalForm({
  draft,
  setDraft,
  saveEntry,
  draftWithAI,
  aiLoading,
  hasAIApiKey,
  onOpenSettings,
  selectedModel,
  setSelectedModel,
  models,
  isCopyPasteOpen,
  setIsCopyPasteOpen,
  contexts,
  activeContexts,
  openActivityContextManager,
  setShowForm,
}: WorkJournalFormProps) {
  const t = useTranslations("workJournal");

  return (
    <div className="text-left w-full">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
        <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 md:p-8 space-y-6">
          <WorkJournalInputModeTabs
            value={draft.input_mode}
            onChange={(mode) =>
              setDraft((current) => ({ ...current, input_mode: mode }))
            }
          />

          <textarea
            className="w-full bg-transparent text-[17px] md:text-lg font-light leading-relaxed text-zinc-200 placeholder:text-zinc-700 outline-none resize-none min-h-[240px]"
            placeholder={t("notesPlaceholder")}
            value={draft.raw_notes}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                raw_notes: event.target.value,
              }))
            }
          />

          {draft.input_mode === "ai_assisted" && (
            <div className="pt-6 border-t border-white/5">
              <WorkJournalAISection
                rawNotes={draft.raw_notes}
                contextId={draft.context_id}
                finalText={draft.final_text}
                onFinalTextChange={(text) =>
                  setDraft((current) => ({ ...current, final_text: text }))
                }
                aiLoading={aiLoading}
                hasAIApiKey={hasAIApiKey}
                onOpenSettings={onOpenSettings}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                models={models}
                isCopyPasteOpen={isCopyPasteOpen}
                setIsCopyPasteOpen={setIsCopyPasteOpen}
                contexts={contexts}
                dateStart={draft.date_start}
                dateEnd={draft.date_end}
                topic={draft.topic}
                onDraftWithAI={draftWithAI}
              />
            </div>
          )}

          <div className="pt-6 border-t border-white/5">
            <WorkJournalFormActions
              onSave={saveEntry}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>

        <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 md:p-8 self-start">
          <WorkJournalFormMetadata
            contextId={draft.context_id}
            onContextChange={(id) =>
              setDraft((current) => ({ ...current, context_id: id }))
            }
            dateStart={draft.date_start}
            onDateStartChange={(date) =>
              setDraft((current) => ({ ...current, date_start: date }))
            }
            dateEnd={draft.date_end}
            onDateEndChange={(date) =>
              setDraft((current) => ({ ...current, date_end: date }))
            }
            topic={draft.topic}
            onTopicChange={(topic) =>
              setDraft((current) => ({ ...current, topic }))
            }
            activeContexts={activeContexts}
            onManageContexts={openActivityContextManager}
          />
        </div>
      </div>
    </div>
  );
}
