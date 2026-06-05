"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, CalendarRange, List } from "lucide-react";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { getErrorMessage } from "@/lib/errors";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { Button } from "@/components/ui/button";
import {
  useWorkJournalContexts,
  useWorkJournalEntries,
} from "../hooks/use-work-journal-queries";
import { useWorkJournalMutations } from "../hooks/use-work-journal-mutations";
import { useWorkJournalRouteState } from "../hooks/use-work-journal-route-state";
import { WorkJournalSidebar } from "./work-journal-sidebar";
import { WorkJournalDetail } from "./work-journal-detail";
import { WorkJournalForm } from "./work-journal-form";
import { WorkJournalTimeline } from "./work-journal-timeline";
import type { TimelineGranularity } from "./work-journal-timeline-utils";

import type { StoredAIProvider } from "@/lib/browser-preferences";

interface WorkJournalViewProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
}

export default function WorkJournalView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
}: WorkJournalViewProps) {
  const t = useTranslations("workJournal");
  const router = useRouter();
  const searchParams = useSearchParams();
  const contextsQuery = useWorkJournalContexts();
  const entriesQuery = useWorkJournalEntries();
  const {
    view,
    timelineEntryId,
    goToList,
    goToTimeline,
    selectTimelineEntry,
    backToTimeline,
  } = useWorkJournalRouteState();

  const [search, setSearch] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [contextFilter, setContextFilter] = useState<string>("");
  const [granularity, setGranularity] = useState<TimelineGranularity>("month");
  const [isCopyPasteOpen, setIsCopyPasteOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<StoredAIProvider>(aiProvider);
  const [selectedModel, setSelectedModel] = useState<string>(aiModel || DEFAULT_GEMINI_MODEL);

  const contexts = contextsQuery.data?.contexts ?? [];
  const entries: import("../api/work-journal-types").WorkJournalEntryLegacy[] = entriesQuery.data ?? [];
  const loading = contextsQuery.isLoading || entriesQuery.isLoading;
  const queryError = contextsQuery.error
    ? getErrorMessage(contextsQuery.error)
    : entriesQuery.error
      ? getErrorMessage(entriesQuery.error)
      : null;
  const activeContexts = contexts.filter((context) => context.status === "active");

  const filteredEntries = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const sorted = [...entries].sort((a, b) =>
      new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
    );
    return sorted.filter((entry) => {
      if (contextFilter && entry.context_id !== contextFilter) return false;
      if (!needle) return true;
      return [entry.topic, entry.raw_notes, entry.final_text, entry.context?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle));
    });
  }, [contextFilter, entries, search]);

  const {
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
  } = useWorkJournalMutations({
    aiProvider: selectedProvider,
    aiApiKey,
    hasAIApiKey,
    onOpenSettings,
    contexts,
    filteredEntries,
    selectedEntryId,
    setSelectedEntryId,
    setIsEditing,
    setShowForm,
  });

  const visibleError = error ?? queryError;

  const activeEntryId = view === "timeline" ? timelineEntryId : selectedEntryId;
  const selectedEntry = useMemo(() => {
    return entries.find(e => e.id === activeEntryId) ?? null;
  }, [entries, activeEntryId]);

  useEffect(() => {
    if (view !== "list") return;
    if (!selectedEntryId && !showForm && filteredEntries.length > 0) {
      setSelectedEntryId(filteredEntries[0].id);
    }
  }, [filteredEntries, selectedEntryId, showForm, view]);

  useEffect(() => {
    if (view === "timeline" && timelineEntryId && !loading && !selectedEntry) {
      backToTimeline();
    }
  }, [view, timelineEntryId, loading, selectedEntry, backToTimeline]);

  useEffect(() => {
    const selectedContextId = searchParams.get("activityContextId");
    if (selectedContextId) {
      setDraft((current) => ({ ...current, context_id: selectedContextId }));
      setShowForm(true);
      setSelectedEntryId(null);
      return;
    }
    const defaultContext =
      contexts.find(
        (context) => context.is_default && context.status === "active"
      ) ?? contexts.find((context) => context.status === "active") ?? null;
    if (defaultContext && !draft.context_id) {
      setDraft((current) => ({ ...current, context_id: defaultContext.id }));
    }
  }, [contexts, draft.context_id, searchParams, setDraft]);

  const openActivityContextManager = () => {
    router.push(
      `/activity-contexts?source=work-journal&returnTo=${encodeURIComponent("/work-journal")}`
    );
  };

  const handleSelectEntry = (id: string) => {
    setSelectedEntryId(id);
    setShowForm(false);
    setIsEditing(false);
    setError(null);
  };

  const applyDefaultContext = () => {
    const defaultContext = contexts.find((c) => c.is_default && c.status === "active")
      ?? contexts.find((c) => c.status === "active");
    if (defaultContext && !draft.context_id) {
      setDraft((current) => ({ ...current, context_id: defaultContext.id }));
    }
  };

  const handleToggleForm = () => {
    if (view === "timeline") {
      goToList();
      setShowForm(true);
      setSelectedEntryId(null);
      setIsEditing(false);
      setError(null);
      applyDefaultContext();
      return;
    }
    if (showForm) {
      setShowForm(false);
      if (filteredEntries.length > 0 && !selectedEntryId) {
        setSelectedEntryId(filteredEntries[0].id);
      }
    } else {
      setShowForm(true);
      setSelectedEntryId(null);
      setIsEditing(false);
      setError(null);
      applyDefaultContext();
    }
  };

  const handleDraftWithAI = () => draftWithAI(selectedProvider, selectedModel);

  const viewToggle = (
    <div className="flex items-center rounded-lg border border-line bg-panel-subtle p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={goToList}
        aria-pressed={view === "list"}
        className={`transition-all duration-200 ${
          view === "list"
            ? "bg-panel-base text-text-main shadow-xs border border-line/40 font-semibold"
            : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
        }`}
      >
        <List className={`h-4 w-4 transition-colors ${view === "list" ? "text-action" : "text-text-soft"}`} />
        {t("timeline.listView")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={goToTimeline}
        aria-pressed={view === "timeline"}
        className={`transition-all duration-200 ${
          view === "timeline"
            ? "bg-panel-base text-text-main shadow-xs border border-line/40 font-semibold"
            : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
        }`}
      >
        <CalendarRange className={`h-4 w-4 transition-colors ${view === "timeline" ? "text-action" : "text-text-soft"}`} />
        {t("timeline.timelineView")}
      </Button>
    </div>
  );

  const detailPane = (
    <WorkJournalDetail
      entry={selectedEntry}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      onSave={patchEntry}
      onDelete={deleteEntry}
      activeContexts={activeContexts}
      onManageContexts={openActivityContextManager}
      hasAIApiKey={hasAIApiKey}
      onOpenSettings={onOpenSettings}
      selectedProvider={selectedProvider}
      setSelectedProvider={setSelectedProvider}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      onDraftEditWithAI={draftEditWithAI}
    />
  );

  return (
    <FeatureScreenShell
      title={t("title")}
      bodyContentClassName={view === "timeline" && !timelineEntryId ? "max-w-none" : undefined}
      actions={
        <>
          {viewToggle}
          <FeatureHeaderActionButton
            label={t("newEntry")}
            onClick={handleToggleForm}
            isActive={view === "list" && showForm}
            cancelLabel={t("close")}
          />
        </>
      }
    >
      {view === "timeline" && !timelineEntryId ? (
        <WorkJournalTimeline
          entries={filteredEntries}
          contexts={contexts}
          isLoading={loading}
          search={search}
          setSearch={setSearch}
          contextFilter={contextFilter}
          setContextFilter={setContextFilter}
          granularity={granularity}
          setGranularity={setGranularity}
          onSelect={selectTimelineEntry}
        />
      ) : view === "timeline" ? (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-line pb-3">
            <Button type="button" variant="ghost" size="sm" onClick={backToTimeline}>
              <ArrowLeft className="h-4 w-4" />
              {t("timeline.backToTimeline")}
            </Button>
          </div>
          {visibleError && (
            <div className="mt-4 text-sm text-rose-400 bg-rose-500/10 px-4 py-3 rounded-lg border border-rose-500/20">
              {visibleError}
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{detailPane}</div>
        </div>
      ) : (
        <FeatureTwoPaneLayout
          sidebar={
            <WorkJournalSidebar
              entries={filteredEntries}
              contexts={contexts}
              selectedId={selectedEntryId}
              isLoading={loading}
              search={search}
              setSearch={setSearch}
              contextFilter={contextFilter}
              setContextFilter={setContextFilter}
              onSelect={handleSelectEntry}
            />
          }
        >
          <div className="flex flex-col gap-4">
            {visibleError && (
              <div className="mb-8 text-sm text-rose-400 bg-rose-500/10 px-4 py-3 rounded-lg border border-rose-500/20">
                {visibleError}
              </div>
            )}

            {showForm ? (
              <div className="px-2 md:px-6 py-4">
                <WorkJournalForm
                  draft={draft}
                  setDraft={setDraft}
                  saveEntry={saveEntry}
                  draftWithAI={handleDraftWithAI}
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
                  openActivityContextManager={openActivityContextManager}
                  setShowForm={setShowForm}
                />
              </div>
            ) : (
              detailPane
            )}
          </div>
        </FeatureTwoPaneLayout>
      )}
    </FeatureScreenShell>
  );
}
