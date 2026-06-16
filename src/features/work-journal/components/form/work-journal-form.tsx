"use client";

import { useTranslations } from "next-intl";
import type {
  WorkJournalContext,
  WorkJournalEntryInputMode,
} from "../../api/work-journal-types";
import { WorkJournalFormMetadata } from "./work-journal-form-metadata";
import { WorkJournalCopyPastePanel } from "./work-journal-copy-paste-panel";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { BasicPanel } from "@/components/shared/basic-panel";
import type { StoredAIProvider } from "@/lib/browser-preferences";

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
  selectedProvider: StoredAIProvider;
  setSelectedProvider: (provider: StoredAIProvider) => void;
  selectedModel: string;
  setSelectedModel: (s: string) => void;
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
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  isCopyPasteOpen,
  setIsCopyPasteOpen,
  contexts,
  activeContexts,
  openActivityContextManager,
  setShowForm,
}: WorkJournalFormProps) {
  const t = useTranslations("workJournal");
  const common = useTranslations("common.actions");
  
  const currentContext =
    contexts.find((context) => context.id === draft.context_id) ?? null;

  return (
    <div className="text-left w-full">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
        <BasicPanel className="w-full p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-2 block">
                {t("finalText")}
              </label>
              <textarea
                className="w-full bg-transparent text-[17px] md:text-lg font-light leading-relaxed text-zinc-200 placeholder:text-zinc-700 outline-none resize-y min-h-[240px] border border-white/10 rounded-xl p-4 focus:border-white/20 transition-colors"
                placeholder={t("notesPlaceholder")}
                value={draft.final_text}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    final_text: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 mb-2 block">
                {t("rawNotes")}
              </label>
              <textarea
                className="w-full bg-transparent text-[15px] font-light leading-relaxed text-zinc-400 placeholder:text-zinc-700 outline-none resize-y min-h-[120px] border border-white/5 rounded-xl p-4 focus:border-white/20 transition-colors"
                placeholder={t("aiNotesPlaceholder")}
                value={draft.raw_notes}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    raw_notes: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          {isCopyPasteOpen && (
            <div className="pt-2">
              <WorkJournalCopyPastePanel
                context={currentContext}
                dateStart={draft.date_start}
                dateEnd={draft.date_end || null}
                topic={draft.topic || null}
                notes={draft.raw_notes}
                onPasteText={(text) => setDraft((current) => ({ ...current, final_text: text }))}
                onClose={() => setIsCopyPasteOpen(false)}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/5">
            <button
              onClick={saveEntry}
              disabled={aiLoading}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("saveChanges")}
            </button>
            <button
              onClick={() => setShowForm(false)}
              disabled={aiLoading}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {common("cancel")}
            </button>

            <div className="ml-auto">
              <AIActionLauncher
                actionLabel={t("generateProfessionalDraft")}
                loading={aiLoading}
                disabled={!draft.raw_notes.trim() || !draft.context_id}
                integrated={{
                  available: hasAIApiKey,
                  selectedProvider,
                  onProviderChange: setSelectedProvider,
                  selectedModelId: selectedModel,
                  onModelChange: setSelectedModel,
                  onRun: draftWithAI,
                  onConfigure: onOpenSettings,
                }}
                copyPaste={{
                  available: true,
                  onOpenFlow: () => setIsCopyPasteOpen(!isCopyPasteOpen),
                }}
              />
            </div>
          </div>
        </BasicPanel>

        <BasicPanel className="w-full p-6 md:p-8 self-start">
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
        </BasicPanel>
      </div>
    </div>
  );
}
