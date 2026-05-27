"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Save, Plus } from "lucide-react";
import type {
  WorkJournalContextLegacy as WorkJournalContext,
  WorkJournalEntryInputMode,
} from "../api/work-journal-types";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { WorkJournalCopyPastePanel } from "./work-journal-copy-paste-panel";

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

const inputClass =
  "w-full bg-transparent border-b border-white/10 px-0 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-300 focus:ring-0";
const labelClass = "text-xs font-medium text-zinc-500 mb-1 block";

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
  const common = useTranslations("common.actions");

  return (
    <div className="pb-16 pt-4 mb-8 border-b border-white/5 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-24">
        
        {/* Left Col: Editor */}
        <div className="space-y-6">
          <div className="flex gap-4 mb-2">
            {(["manual", "ai_assisted"] as WorkJournalEntryInputMode[]).map(
              (mode) => (
                <button
                  key={`mode-${mode}`}
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({ ...current, input_mode: mode }))
                  }
                  className={`text-sm font-medium transition-colors pb-1 border-b-2 ${
                    draft.input_mode === mode
                      ? "text-zinc-100 border-zinc-100"
                      : "text-zinc-600 border-transparent hover:text-zinc-400"
                  }`}
                >
                  {mode === "manual" ? t("freeWriting") : t("aiWriting")}
                </button>
              )
            )}
          </div>

          <textarea
            className="w-full bg-transparent text-xl font-light leading-relaxed text-zinc-200 placeholder:text-zinc-700 outline-none resize-none min-h-[160px]"
            placeholder={t("notesPlaceholder")}
            value={draft.raw_notes}
            onChange={(event) =>
              setDraft((current) => ({ ...current, raw_notes: event.target.value }))
            }
          />

          {draft.input_mode === "ai_assisted" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-end">
                <AIActionLauncher
                  actionLabel={t("generateProfessionalDraft")}
                  loading={aiLoading}
                  disabled={!draft.raw_notes.trim() || !draft.context_id}
                  integrated={{
                    available: hasAIApiKey,
                    selectedModelId: selectedModel,
                    models,
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

              {isCopyPasteOpen && (
                <WorkJournalCopyPastePanel
                  context={
                    contexts.find((context) => context.id === draft.context_id) ??
                    null
                  }
                  dateStart={draft.date_start}
                  dateEnd={draft.date_end || null}
                  topic={draft.topic || null}
                  notes={draft.raw_notes}
                  onPasteText={(finalText) =>
                    setDraft((current) => ({ ...current, final_text: finalText }))
                  }
                  onClose={() => setIsCopyPasteOpen(false)}
                />
              )}
              
              {draft.final_text && (
                <div>
                  <label htmlFor="work-journal-final-text" className={labelClass}>
                    {t("finalText")}
                  </label>
                  <textarea
                    id="work-journal-final-text"
                    className="w-full bg-teal-950/20 text-teal-50/90 rounded-xl p-4 text-base leading-relaxed outline-none resize-none min-h-[160px] border border-teal-900/50"
                    value={draft.final_text}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, final_text: event.target.value }))
                    }
                  />
                </div>
              )}
            </motion.div>
          )}

          <div className="flex items-center gap-4 pt-6">
            <button
              type="button"
              onClick={saveEntry}
              className="px-6 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {t("saveEntry")}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {common("cancel")}
            </button>
          </div>
        </div>

        {/* Right Col: Metadata & Context */}
        <div className="space-y-8">
          <div>
            <label htmlFor="work-journal-context" className={labelClass}>{t("context")}</label>
            <select
              id="work-journal-context"
              className={inputClass}
              value={draft.context_id}
              onChange={(event) =>
                setDraft((current) => ({ ...current, context_id: event.target.value }))
              }
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-500">{t("selectContext")}</option>
              {activeContexts.map((context) => (
                <option key={`form-ctx-${context.id}`} value={context.id} className="bg-zinc-900 text-zinc-200">
                  {context.name} {context.type === 'project' ? t("projectSuffix") : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>{t("dateFrom")}</label>
              <input
                type="date"
                className={inputClass}
                value={draft.date_start}
                onChange={(event) => setDraft((current) => ({ ...current, date_start: event.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>{t("dateTo")}</label>
              <input
                type="date"
                className={inputClass}
                value={draft.date_end}
                onChange={(event) => setDraft((current) => ({ ...current, date_end: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("topic")}</label>
            <input
              className={inputClass}
              placeholder={t("topicPlaceholder")}
              value={draft.topic}
              onChange={(event) => setDraft((current) => ({ ...current, topic: event.target.value }))}
            />
          </div>

          <div className="pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={openActivityContextManager}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <Plus className="h-4 w-4" />
              {t("manageContexts")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
