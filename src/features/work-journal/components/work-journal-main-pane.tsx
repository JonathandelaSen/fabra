"use client";

import type { Dispatch, SetStateAction } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import type {
  WorkJournalContextLegacy as WorkJournalContext,
  WorkJournalEntryLegacy as WorkJournalEntry,
} from "../api/work-journal-types";
import type { WorkJournalDraft } from "../hooks/use-work-journal-mutations";
import type { WorkJournalRouteView } from "../hooks/use-work-journal-route-state";
import { WorkJournalDetail } from "./work-journal-detail";
import { WorkJournalForm } from "./work-journal-form";
import { WorkJournalSkeleton } from "./work-journal-skeleton";
import { WorkJournalTimeline } from "./work-journal-timeline";
import type { TimelineGranularity } from "./work-journal-timeline-utils";

interface WorkJournalMainPaneProps {
  activeContexts: WorkJournalContext[];
  aiLoading: boolean;
  contexts: WorkJournalContext[];
  draft: WorkJournalDraft;
  draftEditWithAI: (
    contextId: string,
    dateStart: string,
    dateEnd: string | null,
    topic: string | null,
    notes: string,
    provider: StoredAIProvider,
    modelId: string,
  ) => Promise<string>;
  draftWithAI: (provider: StoredAIProvider, modelId: string) => Promise<void>;
  filteredEntries: WorkJournalEntry[];
  granularity: TimelineGranularity;
  hasAIApiKey: boolean;
  isCopyPasteOpen: boolean;
  isEditing: boolean;
  isResolvingQueries: boolean;
  onBackToTimeline: () => void;
  onDelete: (entry: WorkJournalEntry) => void;
  onManageContexts: () => void;
  onOpenSettings: () => void;
  onSave: (entry: WorkJournalEntry, updates: Partial<WorkJournalEntry>) => void;
  onSelectTimelineEntry: (id: string) => void;
  saveEntry: () => Promise<void>;
  selectedEntry: WorkJournalEntry | null;
  selectedModel: string;
  selectedProvider: StoredAIProvider;
  setDraft: Dispatch<SetStateAction<WorkJournalDraft>>;
  setGranularity: (granularity: TimelineGranularity) => void;
  setIsCopyPasteOpen: Dispatch<SetStateAction<boolean>>;
  setIsEditing: (editing: boolean) => void;
  setSelectedModel: (model: string) => void;
  setSelectedProvider: (provider: StoredAIProvider) => void;
  setShowForm: (show: boolean) => void;
  showForm: boolean;
  timelineEntryId: string | null;
  view: WorkJournalRouteView;
  isFiltered: boolean;
}

export function WorkJournalMainPane({
  activeContexts,
  aiLoading,
  contexts,
  draft,
  draftEditWithAI,
  draftWithAI,
  filteredEntries,
  granularity,
  hasAIApiKey,
  isCopyPasteOpen,
  isEditing,
  isResolvingQueries,
  onBackToTimeline,
  onDelete,
  onManageContexts,
  onOpenSettings,
  onSave,
  onSelectTimelineEntry,
  saveEntry,
  selectedEntry,
  selectedModel,
  selectedProvider,
  setDraft,
  setGranularity,
  setIsCopyPasteOpen,
  setIsEditing,
  setSelectedModel,
  setSelectedProvider,
  setShowForm,
  showForm,
  timelineEntryId,
  view,
  isFiltered,
}: WorkJournalMainPaneProps) {
  const t = useTranslations("workJournal");

  if (isResolvingQueries) {
    return <WorkJournalSkeleton />;
  }

  if (showForm) {
    return (
      <div className="px-2 md:px-6 py-4">
        <WorkJournalForm
          draft={draft}
          setDraft={setDraft}
          saveEntry={saveEntry}
          draftWithAI={() => draftWithAI(selectedProvider, selectedModel)}
          aiLoading={aiLoading}
          hasAIApiKey={hasAIApiKey}
          onOpenSettings={onOpenSettings}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isCopyPasteOpen={isCopyPasteOpen}
          setIsCopyPasteOpen={setIsCopyPasteOpen}
          contexts={contexts}
          activeContexts={activeContexts}
          openActivityContextManager={onManageContexts}
          setShowForm={setShowForm}
        />
      </div>
    );
  }

  if (view === "timeline" && !timelineEntryId) {
    return (
      <WorkJournalTimeline
        entries={filteredEntries}
        isLoading={isResolvingQueries}
        isFiltered={isFiltered}
        granularity={granularity}
        setGranularity={setGranularity}
        onSelect={onSelectTimelineEntry}
      />
    );
  }

  const detail = (
    <WorkJournalDetail
      entry={selectedEntry}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      onSave={onSave}
      onDelete={onDelete}
      activeContexts={activeContexts}
      onManageContexts={onManageContexts}
      hasAIApiKey={hasAIApiKey}
      onOpenSettings={onOpenSettings}
      selectedProvider={selectedProvider}
      setSelectedProvider={setSelectedProvider}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      onDraftEditWithAI={draftEditWithAI}
    />
  );

  if (view === "timeline") {
    return (
      <div className="flex flex-col">
        <div className="px-2 md:px-6 pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onBackToTimeline}>
            <ArrowLeft className="h-4 w-4" />
            {t("timeline.backToTimeline")}
          </Button>
        </div>
        {detail}
      </div>
    );
  }

  return detail;
}
