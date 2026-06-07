"use client";

import { useTranslations } from "next-intl";
import type { WorkJournalEntryLegacy as WorkJournalEntry, WorkJournalContextLegacy as WorkJournalContext } from "../api/work-journal-types";
import { WorkJournalEntryDisplay } from "./work-journal-entry-display";
import { WorkJournalEntryEditor } from "./work-journal-entry-editor";
import { WorkJournalEmptyState } from "./work-journal-empty-state";
import { FilePenLine } from "lucide-react";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import { cn } from "@/lib/utils";

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
  isTimelineView?: boolean;
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
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  onDraftEditWithAI,
  isTimelineView = false,
}: WorkJournalDetailProps) {
  const t = useTranslations("workJournal");

  if (!entry) {
    return <WorkJournalEmptyState icon={FilePenLine} text={t("empty")} />;
  }

  return (
    <div className={cn("pb-4 w-full", isTimelineView ? "lg:pt-2 lg:pb-8" : "lg:py-8")}>
      {isEditing ? (
        <WorkJournalEntryEditor
          entry={entry}
          onSave={(updates) => onSave(entry, updates)}
          onCancel={() => setIsEditing(false)}
          activeContexts={activeContexts}
          onManageContexts={onManageContexts}
          hasAIApiKey={hasAIApiKey}
          onOpenSettings={onOpenSettings}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
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
