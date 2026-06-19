"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FeatureHeaderActionButton } from "@/frontend/components/shared/feature-header-action-button";
import { getErrorMessage } from "@/lib/errors";
import { FeatureScreenShell } from "@/frontend/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/frontend/components/shared/feature-two-pane-layout";
import { useIsDesktopLayout } from "@/frontend/components/shared/use-is-desktop-layout";
import {
  useWorkJournalContexts,
  useWorkJournalEntries,
} from "../hooks/use-work-journal-queries";
import { useWorkJournalMutations } from "../hooks/use-work-journal-mutations";
import { useWorkJournalRouteState } from "../hooks/use-work-journal-route-state";
import { WorkJournalSidebar } from "./sidebar/work-journal-sidebar";
import { WorkJournalMainPane } from "./work-journal-main-pane";
import { WorkJournalViewToggle } from "./work-journal-view-toggle";
import {
  shouldAutoSelectWorkJournalEntry,
  shouldClearMissingWorkJournalSelection,
  shouldShowWorkJournalMainLoader,
} from "./work-journal-loading-state";
import type { TimelineGranularity } from "./timeline/work-journal-timeline-utils";

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
    listEntryId,
    timelineEntryId,
    pathname,
    goToList,
    goToTimeline,
    replaceListEntry,
    selectListEntry,
    selectTimelineEntry,
    backToTimeline,
  } = useWorkJournalRouteState();
  const isOnWorkJournalRoute = pathname.startsWith("/work-journal");

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
  const entries = entriesQuery.data ?? [];
  const isListPending = entriesQuery.isPending;
  const isContextsPending = contextsQuery.isPending;
  const queryError = contextsQuery.error
    ? getErrorMessage(contextsQuery.error)
    : entriesQuery.error
      ? getErrorMessage(entriesQuery.error)
      : null;
  const activeContexts = contexts.filter((context) => context.status === "active");

  const filteredEntries = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const sorted = [...entries].sort((a, b) =>
      new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime()
    );
    return sorted.filter((entry) => {
      if (contextFilter && entry.contextId !== contextFilter) return false;
      if (!needle) return true;
      return [entry.topic, entry.rawNotes, entry.finalText, entry.context?.name]
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
    onEntrySelectionChange: (id) => {
      if (id) {
        selectListEntry(id);
      } else {
        goToList();
      }
    },
    setIsEditing,
    setShowForm,
  });

  const visibleError = error ?? queryError;

  const activeEntryId = view === "timeline" ? timelineEntryId : (listEntryId ?? selectedEntryId);
  const selectedEntry = useMemo(() => {
    return entries.find(e => e.id === activeEntryId) ?? null;
  }, [entries, activeEntryId]);
  const isDesktopLayout = useIsDesktopLayout();

  useEffect(() => {
    if (
      isOnWorkJournalRoute &&
      isDesktopLayout &&
      shouldAutoSelectWorkJournalEntry({
        activeEntryId,
        entryCount: filteredEntries.length,
        isListPending,
        showForm,
        view,
      })
    ) {
      const nextId = filteredEntries[0].id;
      replaceListEntry(nextId);
    }
  }, [activeEntryId, filteredEntries, isDesktopLayout, isListPending, isOnWorkJournalRoute, replaceListEntry, showForm, view]);

  useEffect(() => {
    if (!isOnWorkJournalRoute) {
      return;
    }
    if (
      view === "timeline" &&
      shouldClearMissingWorkJournalSelection({
        isListPending,
        routeEntryId: timelineEntryId,
        selectedEntryExists: Boolean(selectedEntry),
      })
    ) {
      backToTimeline();
    } else if (
      view === "list" &&
      shouldClearMissingWorkJournalSelection({
        isListPending,
        routeEntryId: listEntryId,
        selectedEntryExists: Boolean(selectedEntry),
      })
    ) {
      goToList();
    }
  }, [view, timelineEntryId, listEntryId, isListPending, isOnWorkJournalRoute, selectedEntry, backToTimeline, goToList]);

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
        (context) => context.isDefault && context.status === "active"
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
    selectListEntry(id);
    setShowForm(false);
    setIsEditing(false);
    setError(null);
  };

  const applyDefaultContext = () => {
    const defaultContext = contexts.find((c) => c.isDefault && c.status === "active")
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

  return (
    <FeatureScreenShell
      title={t("title")}
      mobileBackActive={
        view === "timeline"
          ? Boolean(timelineEntryId)
          : (Boolean(listEntryId) || showForm)
      }
      onMobileBack={
        view === "timeline"
          ? backToTimeline
          : (showForm ? () => setShowForm(false) : goToList)
      }
      actions={
        <>
          <WorkJournalViewToggle
            view={view}
            onGoToList={goToList}
            onGoToTimeline={goToTimeline}
          />
          <FeatureHeaderActionButton
            label={t("newEntry")}
            onClick={handleToggleForm}
            isActive={view === "list" && showForm}
            cancelLabel={t("close")}
          />
        </>
      }
    >
      <FeatureTwoPaneLayout
        mobileDetailActive={
          view === "timeline"
            ? true
            : (listEntryId || showForm ? true : false)
        }
        sidebar={
          <WorkJournalSidebar
            entries={filteredEntries}
            contexts={contexts}
            selectedId={activeEntryId}
            isLoading={isListPending}
            search={search}
            setSearch={setSearch}
            contextFilter={contextFilter}
            setContextFilter={setContextFilter}
            onSelect={view === "timeline" ? selectTimelineEntry : handleSelectEntry}
          />
        }
      >
        <div className="flex flex-col gap-4">
          {visibleError && (
            <div className="mb-8 text-sm text-danger-text bg-danger-soft px-4 py-3 rounded-lg border border-danger-border">
              {visibleError}
            </div>
          )}
          <WorkJournalMainPane
            activeContexts={activeContexts}
            aiLoading={aiLoading}
            contexts={contexts}
            draft={draft}
            draftEditWithAI={draftEditWithAI}
            draftWithAI={draftWithAI}
            filteredEntries={filteredEntries}
            granularity={granularity}
            hasAIApiKey={hasAIApiKey}
            isCopyPasteOpen={isCopyPasteOpen}
            isEditing={isEditing}
            isFiltered={Boolean(search || contextFilter)}
            isResolvingQueries={shouldShowWorkJournalMainLoader({
              activeEntryId,
              entryCount: filteredEntries.length,
              isContextsPending,
              isListPending,
              showForm,
              view,
            })}
            onBackToTimeline={backToTimeline}
            onDelete={deleteEntry}
            onManageContexts={openActivityContextManager}
            onOpenSettings={onOpenSettings}
            onSave={patchEntry}
            onSelectTimelineEntry={selectTimelineEntry}
            saveEntry={saveEntry}
            selectedEntry={selectedEntry}
            selectedModel={selectedModel}
            selectedProvider={selectedProvider}
            setDraft={setDraft}
            setGranularity={setGranularity}
            setIsCopyPasteOpen={setIsCopyPasteOpen}
            setIsEditing={setIsEditing}
            setSelectedModel={setSelectedModel}
            setSelectedProvider={setSelectedProvider}
            setShowForm={setShowForm}
            showForm={showForm}
            timelineEntryId={timelineEntryId}
            view={view}
            onCreate={handleToggleForm}
          />
        </div>
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
