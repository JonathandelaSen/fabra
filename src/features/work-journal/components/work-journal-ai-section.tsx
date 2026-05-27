"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { WorkJournalContextLegacy as WorkJournalContext } from "../api/work-journal-types";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { WorkJournalCopyPastePanel } from "./work-journal-copy-paste-panel";

const labelClass = "text-xs font-medium text-zinc-500 mb-1 block";

interface WorkJournalAISectionProps {
  rawNotes: string;
  contextId: string;
  finalText: string;
  onFinalTextChange: (text: string) => void;
  aiLoading: boolean;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  selectedModel: string;
  setSelectedModel: (s: string) => void;
  models: { id: string; label: string }[];
  isCopyPasteOpen: boolean;
  setIsCopyPasteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  contexts: WorkJournalContext[];
  dateStart: string;
  dateEnd: string;
  topic: string;
  onDraftWithAI: () => Promise<void>;
}

export function WorkJournalAISection({
  rawNotes,
  contextId,
  finalText,
  onFinalTextChange,
  aiLoading,
  hasAIApiKey,
  onOpenSettings,
  selectedModel,
  setSelectedModel,
  models,
  isCopyPasteOpen,
  setIsCopyPasteOpen,
  contexts,
  dateStart,
  dateEnd,
  topic,
  onDraftWithAI,
}: WorkJournalAISectionProps) {
  const t = useTranslations("workJournal");

  const currentContext =
    contexts.find((context) => context.id === contextId) ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 pt-4 border-t border-white/5"
    >
      <div className="flex justify-end">
        <AIActionLauncher
          actionLabel={t("generateProfessionalDraft")}
          loading={aiLoading}
          disabled={!rawNotes.trim() || !contextId}
          integrated={{
            available: hasAIApiKey,
            selectedModelId: selectedModel,
            models,
            onModelChange: setSelectedModel,
            onRun: onDraftWithAI,
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
          context={currentContext}
          dateStart={dateStart}
          dateEnd={dateEnd || null}
          topic={topic || null}
          notes={rawNotes}
          onPasteText={onFinalTextChange}
          onClose={() => setIsCopyPasteOpen(false)}
        />
      )}

      {finalText && (
        <div>
          <label htmlFor="work-journal-final-text" className={labelClass}>
            {t("finalText")}
          </label>
          <textarea
            id="work-journal-final-text"
            className="w-full bg-teal-950/20 text-teal-50/90 rounded-xl p-4 text-base leading-relaxed outline-none resize-none min-h-[160px] border border-teal-900/50"
            value={finalText}
            onChange={(event) => onFinalTextChange(event.target.value)}
          />
        </div>
      )}
    </motion.div>
  );
}
