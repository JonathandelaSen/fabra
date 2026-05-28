"use client";

import { useTranslations } from "next-intl";
import type { WorkJournalEntryLegacy as WorkJournalEntry, WorkJournalContextLegacy as WorkJournalContext } from "../api/work-journal-types";
import { WorkJournalEntryDisplay } from "./work-journal-entry-display";
import { WorkJournalEntryEditor } from "./work-journal-entry-editor";
import { WorkJournalEmptyState } from "./work-journal-empty-state";
import { FilePenLine } from "lucide-react";

interface WorkJournalDetailProps {
  entry: WorkJournalEntry | null;
  isEditing: boolean;
  setIsEditing: (b: boolean) => void;
  onSave: (entry: WorkJournalEntry, updates: Partial<WorkJournalEntry>) => void;
  onDelete: (entry: WorkJournalEntry) => void;
  activeContexts: WorkJournalContext[];
  onManageContexts: () => void;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  selectedModel: string;
  setSelectedModel: (s: string) => void;
  models: { id: string; label: string }[];
  onDraftEditWithAI: (
    contextId: string,
    dateStart: string,
    dateEnd: string | null,
    topic: string | null,
    notes: string,
    modelId: string
  ) => Promise<string>;
}

export function WorkJournalDetail({
  entry,
  isEditing,
  setIsEditing,
  onSave,
  onDelete,
  activeContexts,
  onManageContexts,
  hasAIApiKey,
  onOpenSettings,
  selectedModel,
  setSelectedModel,
  models,
  onDraftEditWithAI,
}: WorkJournalDetailProps) {
  const t = useTranslations("workJournal");

  if (!entry) {
    return <WorkJournalEmptyState icon={FilePenLine} text={t("empty")} />;
  }

  return (
    <div className="py-4 lg:py-8 w-full px-4 md:px-8">
      {isEditing ? (
        <WorkJournalEntryEditor
          entry={entry}
          onSave={(updates) => onSave(entry, updates)}
          onCancel={() => setIsEditing(false)}
          activeContexts={activeContexts}
          onManageContexts={onManageContexts}
          hasAIApiKey={hasAIApiKey}
          onOpenSettings={onOpenSettings}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          models={models}
          onDraftEditWithAI={onDraftEditWithAI}
        />
      ) : (
        <WorkJournalEntryDisplay
          entry={entry}
          onEdit={() => setIsEditing(true)}
          onDelete={() => onDelete(entry)}
        />
      )}
    </div>
  );
}
