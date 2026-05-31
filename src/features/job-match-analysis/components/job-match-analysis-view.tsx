"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Columns3, List, Search } from "lucide-react";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { DeleteButton } from "@/components/shared/action-buttons";
import type { OfferStatus } from "@/lib/analysis-types";
import type { InterviewQuestionSummary } from "../types";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { Button } from "@/components/ui/button";
import {
  useJobMatchAnalysisList,
  useJobMatchAnalysisDetail,
} from "../hooks/use-job-match-analysis-queries";
import { useJobMatchAnalysisMutations } from "../hooks/use-job-match-analysis-mutations";
import { useJobMatchAnalysisRouteState } from "../hooks/use-job-match-analysis-route-state";
import { useJobMatchCopyPasteApplied } from "../hooks/use-job-match-copy-paste-applied";
import JobMatchAnalysisList from "./job-match-analysis-list";
import { JobMatchAnalysisContent } from "./job-match-analysis-content";
import { JobMatchKanbanBoard } from "./job-match-kanban-board";

import { getAIRequestConfigForProvider, type StoredAIProvider } from "@/lib/browser-preferences";

interface JobMatchAnalysisViewProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onNewAnalysis: () => void;
  onOpenQuestions?: (options?: { cvId?: string | null; analysisId?: string | null }) => void;
  interviewQuestions?: InterviewQuestionSummary[];
  onInterviewQuestionCreated?: () => void;
}

export default function JobMatchAnalysisView({
  aiProvider,
  aiApiKey,
  hasAIApiKey,
  onOpenSettings,
  onNewAnalysis,
  onOpenQuestions,
  interviewQuestions = [],
  onInterviewQuestionCreated,
}: JobMatchAnalysisViewProps) {
  const listT = useTranslations("analysisFlow.lists");
  const kanbanT = useTranslations("analysisFlow.kanban");
  const alertsT = useTranslations("analysisFlow.alerts");
  const routeState = useJobMatchAnalysisRouteState();
  const listQuery = useJobMatchAnalysisList();
  const mutations = useJobMatchAnalysisMutations();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    analysisId,
    isAnalysisView,
    analysisTab,
    view,
    selectAnalysis,
    clearSelection,
    replaceAnalysis,
    goToBoard,
    goToListView,
    goToAnalysis,
    goToExtraction,
    setAnalysisTab,
  } = routeState;

  const detailQuery = useJobMatchAnalysisDetail(analysisId);
  const analyses = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const filteredAnalyses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return analyses;
    return analyses.filter((analysis) => {
      const title = analysis.title || analysis.filename.replace(/\.pdf$/i, "");
      return title.toLowerCase().includes(query);
    });
  }, [analyses, searchQuery]);
  const detail = detailQuery.data ?? null;
  const selectedIdInCurrentList =
    filteredAnalyses.find((analysis) => analysis.id === analysisId)?.id ?? null;

  useEffect(() => {
    if (
      view === "list" &&
      routeState.pathname === "/job-analyses" &&
      !analysisId &&
      analyses[0]?.id
    ) {
      replaceAnalysis(analyses[0].id);
    }
  }, [analysisId, analyses, replaceAnalysis, routeState.pathname, view]);

  const selectItem = (id: string) => {
    selectAnalysis(id);
  };

  const handleDelete = async (id: string) => {
    const currentIndex = analyses.findIndex((analysis) => analysis.id === id);
    const nextSelection =
      analyses[currentIndex + 1]?.id ?? analyses[currentIndex - 1]?.id ?? null;
    await mutations.deleteAnalysis.mutateAsync(id);
    if (analysisId === id) {
      if (nextSelection) {
        replaceAnalysis(nextSelection);
      } else {
        clearSelection();
      }
    }
  };

  const deleteFromKanban = async (id: string) => {
    if (!confirm(alertsT("confirmDelete"))) return;

    try {
      await handleDelete(id);
    } catch (error) {
      console.error("Error deleting analysis:", error);
      alert(alertsT("deleteFailed"));
    }
  };

  const moveKanbanCard = (id: string, status: NonNullable<OfferStatus>) => {
    mutations.moveAnalysisCard.mutate({ id, status });
  };

  const deleteSelected = async () => {
    if (!analysisId) return;
    if (!confirm(alertsT("confirmDelete"))) return;

    try {
      await handleDelete(analysisId);
    } catch (error) {
      console.error("Error deleting analysis:", error);
      alert(alertsT("deleteFailed"));
    }
  };

  const persistUrl = async (url: string) => {
    if (!analysisId) return;
    await mutations.updateAnalysis.mutateAsync({
      id: analysisId,
      updates: { jobUrl: url || null },
    });
  };

  const persistTracking = async (
    updates: { offerStatus: OfferStatus; offerNotes: string; offerNextAction: string; offerNextActionAt: string },
  ) => {
    if (!analysisId) return;
    await mutations.updateAnalysis.mutateAsync({
      id: analysisId,
      updates: {
        offerStatus: updates.offerStatus,
        offerNotes: updates.offerNotes,
        offerNextAction: updates.offerNextAction,
        offerNextActionAt: updates.offerNextActionAt || null,
      },
    });
  };

  const runScore = async (
    input: { jobDescription: string; jobUrl: string; provider: StoredAIProvider; model: string },
  ) => {
    if (!analysisId) return;
    const aiConfig = getAIRequestConfigForProvider(input.provider, aiApiKey, input.model);
    if (aiConfig.error) throw new Error(aiConfig.error);
    await mutations.scoreAnalysis.mutateAsync({
      id: analysisId,
      input: {
        provider: aiConfig.provider,
        apiKey: aiConfig.apiKey,
        baseUrl: aiConfig.baseUrl,
        model: aiConfig.model,
        jobDescription: input.jobDescription,
        jobUrl: input.jobUrl || null,
      },
    });
    goToAnalysis("summary");
  };

  const applyCopyPasteResult = useJobMatchCopyPasteApplied(() => goToAnalysis("summary"));

  const openQuestions = () => {
    onOpenQuestions?.({
      cvId: detail?.cvId,
      analysisId: detail?.id,
    });
  };

  const filteredInterviewQuestions = useMemo(
    () =>
      analysisId
        ? interviewQuestions.filter((q) => q.analysisId === analysisId)
        : [],
    [interviewQuestions, analysisId],
  );

  const hasScore = detail?.aiScore !== null && detail?.aiScore !== undefined;
  const detailContent = (
    <JobMatchAnalysisContent
      analysisId={analysisId}
      detail={detail}
      isLoading={detailQuery.isLoading}
      isAnalysisView={isAnalysisView}
      hasScore={hasScore}
      analysisTab={analysisTab}
      aiApiKey={aiApiKey}
      hasAIApiKey={hasAIApiKey}
      filteredInterviewQuestions={filteredInterviewQuestions}
      onCopyPasteApplied={applyCopyPasteResult}
      onOpenQuestions={openQuestions}
      onOpenSettings={onOpenSettings}
      onScore={runScore}
      onTabChange={setAnalysisTab}
      onViewModeChange={(tab) =>
        tab === "analysis" ? goToAnalysis() : goToExtraction()
      }
      onInterviewQuestionCreated={onInterviewQuestionCreated}
      onUpdateUrl={persistUrl}
      onUpdateTracking={persistTracking}
    />
  );

  return (
    <FeatureScreenShell
      title={listT("jobTitle")}
      actions={
        <>
          <div className="flex items-center rounded-lg border border-line bg-panel-subtle p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goToListView}
              aria-pressed={view === "list"}
              className={`transition-all duration-200 ${
                view === "list"
                  ? "bg-panel-base text-text-main shadow-xs border border-line/40 font-semibold"
                  : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
              }`}
            >
              <List className={`h-4 w-4 transition-colors ${view === "list" ? "text-action" : "text-text-soft"}`} />
              {kanbanT("listView")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goToBoard}
              aria-pressed={view === "kanban"}
              className={`transition-all duration-200 ${
                view === "kanban"
                  ? "bg-panel-base text-text-main shadow-xs border border-line/40 font-semibold"
                  : "text-text-soft hover:text-text-main hover:bg-panel-hover/50 border-transparent"
              }`}
            >
              <Columns3 className={`h-4 w-4 transition-colors ${view === "kanban" ? "text-action" : "text-text-soft"}`} />
              {kanbanT("boardView")}
            </Button>
          </div>
          <FeatureHeaderActionButton
            label={listT("newOffer")}
            onClick={onNewAnalysis}
          />
          {analysisId && (
            <DeleteButton
              onClick={() => void deleteSelected()}
              disabled={mutations.deleteAnalysis.isPending}
              aria-label={listT("deleteOffer")}
            />
          )}
        </>
      }
    >
      {view === "kanban" && !analysisId ? (
        <div className="flex h-full min-h-0 flex-col gap-3">
          <label className="relative block w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="search"
              placeholder={listT("searchOffers")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pl-9 pr-3 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-indigo-500/40"
            />
          </label>
          <JobMatchKanbanBoard
            analyses={filteredAnalyses}
            searchQuery={searchQuery}
            isLoading={listQuery.isLoading}
            isMoving={mutations.moveAnalysisCard.isPending}
            onSelect={selectItem}
            onDelete={(id) => void deleteFromKanban(id)}
            onMove={moveKanbanCard}
          />
        </div>
      ) : view === "kanban" ? (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-panel-base">
          <div className="shrink-0 border-b border-line px-4 py-3">
            <Button type="button" variant="ghost" size="sm" onClick={goToBoard}>
              <ArrowLeft className="h-4 w-4" />
              {kanbanT("backToBoard")}
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {detailContent}
          </div>
        </div>
      ) : (
        <FeatureTwoPaneLayout
          sidebar={
            <JobMatchAnalysisList
              analyses={filteredAnalyses}
              selectedId={selectedIdInCurrentList}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelect={selectItem}
              isLoading={listQuery.isLoading}
            />
          }
          mainClassName="overflow-hidden"
        >
          {detailContent}
        </FeatureTwoPaneLayout>
      )}
    </FeatureScreenShell>
  );
}
