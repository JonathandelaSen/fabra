"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useConfirm } from "@/components/shared/confirm-provider";
import type { OfferStatus } from "@/lib/analysis-types";
import type { InterviewQuestionSummary } from "../types";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { useIsDesktopLayout } from "@/components/shared/use-is-desktop-layout";
import { useJobMatchAnalysisList, useJobMatchAnalysisDetail, useJobMatchAnalysisCVOptions } from "../hooks/use-job-match-analysis-queries";
import { useJobMatchAnalysisMutations } from "../hooks/use-job-match-analysis-mutations";
import { shouldShowJobMatchAnalysisView, useJobMatchAnalysisRouteState } from "../hooks/use-job-match-analysis-route-state";
import { JOB_MATCH_DETAIL_TABS, JOB_MATCH_VIEW_MODES } from "../constants";
import { useJobMatchCopyPasteApplied } from "../hooks/use-job-match-copy-paste-applied";
import { useJobMatchAnalysisExport } from "../hooks/use-job-match-analysis-export";
import { useNewJobMatchFlowActions } from "../hooks/use-new-job-match-flow-actions";
import { useImmediateAnalysisSelection } from "../hooks/use-immediate-analysis-selection";
import { JobMatchAnalysisContent } from "./job-match-analysis-content";
import { JobMatchAnalysisBody } from "./job-match-analysis-body";
import { JobMatchAnalysisHeaderActions } from "./job-match-analysis-header-actions";
import { shouldAutoSelectJobMatchAnalysis, shouldShowJobMatchAnalysisMainLoader } from "./job-match-analysis-loading-state";
import NewJobMatchFlow from "./new-flow/new-job-match-flow";
import { PendingJobMatchCopyPasteModal } from "./copy-paste/pending-job-match-copy-paste-modal";
import { getAIRequestConfigForProvider, type StoredAIProvider } from "@/lib/browser-preferences";

interface JobMatchAnalysisViewProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onOpenQuestions?: (options?: { cvId?: string | null; analysisId?: string | null }) => void;
  interviewQuestions?: InterviewQuestionSummary[];
  onInterviewQuestionCreated?: () => void;
}

export default function JobMatchAnalysisView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
  onOpenQuestions,
  interviewQuestions = [],
  onInterviewQuestionCreated,
}: JobMatchAnalysisViewProps) {
  const listT = useTranslations("analysisFlow.lists");
  const kanbanT = useTranslations("analysisFlow.kanban");
  const alertsT = useTranslations("analysisDetail.alerts");
  const scoreT = useTranslations("analysisDetail.score");
  const confirm = useConfirm();
  const routeState = useJobMatchAnalysisRouteState();
  const {
    analysisId,
    isAnalysisView,
    isExplicitExtractionView,
    analysisTab,
    view,
    mode,
    selectAnalysis,
    clearSelection,
    replaceAnalysis,
    goToNew,
    goToBoard,
    goToListView,
    goToAnalysis,
    goToAnalysisById,
    goToExtraction,
    setAnalysisTab,
  } = routeState;
  const listQuery = useJobMatchAnalysisList();
  const cvOptionsQuery = useJobMatchAnalysisCVOptions();
  const mutations = useJobMatchAnalysisMutations();
  const [searchQuery, setSearchQuery] = useState("");
  const immediateSelection = useImmediateAnalysisSelection(analysisId);
  const {
    newFlowError,
    pendingCopyPasteAnalysis,
    setPendingCopyPasteAnalysis,
    createCV,
    runNewIntegratedAnalysis,
    openNewCopyPasteFlow,
  } = useNewJobMatchFlowActions({
    mutations,
    aiApiKey,
    replaceAnalysis,
    goToAnalysisById,
  });
  const detailQuery = useJobMatchAnalysisDetail(immediateSelection.selectedAnalysisId);
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
  const selectedIdInCurrentList = filteredAnalyses.find(
    (analysis) => analysis.id === immediateSelection.selectedAnalysisId,
  )?.id ?? null;
  const isResolvingList = listQuery.isFetching;
  const isListPending = listQuery.isPending;
  const isDetailPending = detailQuery.isPending;
  const isDesktopLayout = useIsDesktopLayout();
  useEffect(() => {
    if (
      isDesktopLayout &&
      shouldAutoSelectJobMatchAnalysis({
        analysisCount: analyses.length,
        analysisId,
        isListPending,
        mode,
        pathname: routeState.pathname,
        view,
      })
    ) {
      const firstHasScore = analyses[0].aiScore !== null && analyses[0].aiScore !== undefined;
      replaceAnalysis(analyses[0].id, firstHasScore);
    }
  }, [analysisId, analyses, isDesktopLayout, isListPending, mode, replaceAnalysis, routeState.pathname, view]);

  const selectItem = (id: string) => {
    const item = analyses.find((a) => a.id === id);
    const itemHasScore = item?.aiScore !== null && item?.aiScore !== undefined;
    immediateSelection.selectImmediately(id);
    selectAnalysis(id, itemHasScore);
  };

  const handleDelete = async (id: string) => {
    const currentIndex = analyses.findIndex((analysis) => analysis.id === id);
    const nextItem =
      analyses[currentIndex + 1] ?? analyses[currentIndex - 1] ?? null;
    await mutations.deleteAnalysis.mutateAsync(id);
    if (analysisId === id) {
      if (nextItem) {
        const nextHasScore = nextItem.aiScore !== null && nextItem.aiScore !== undefined;
        replaceAnalysis(nextItem.id, nextHasScore);
      } else {
        clearSelection();
      }
    }
  };

  const deleteFromKanban = async (id: string) => {
    if (!(await confirm({ title: alertsT("confirmDelete") }))) return;

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
    if (!(await confirm({ title: alertsT("confirmDelete") }))) return;

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
    goToAnalysis(JOB_MATCH_DETAIL_TABS.summary);
  };
  const applyCopyPasteResult = useJobMatchCopyPasteApplied(() => goToAnalysis(JOB_MATCH_DETAIL_TABS.summary));

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
  const exportAnalysis = useJobMatchAnalysisExport({ analysis: detail });
  const shouldShowAnalysisView = shouldShowJobMatchAnalysisView({
    hasScore,
    isAnalysisView,
    isExplicitExtractionView,
  });
  const detailContent = (
    <JobMatchAnalysisContent
      analysisId={immediateSelection.selectedAnalysisId}
      detail={detail}
      analysesCount={analyses.length}
      isLoading={shouldShowJobMatchAnalysisMainLoader({
        analysisCount: filteredAnalyses.length,
        analysisId,
        isDetailPending,
        isListPending,
        mode,
        pathname: routeState.pathname,
        view,
      })}
      isAnalysisView={shouldShowAnalysisView}
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
        tab === JOB_MATCH_VIEW_MODES.analysis ? goToAnalysis() : goToExtraction()
      }
      onUpdateUrl={persistUrl}
      onUpdateTracking={persistTracking}
      onInterviewQuestionCreated={onInterviewQuestionCreated}
      onCreate={goToNew}
    />
  );

  const newFlow = (
    <NewJobMatchFlow
      cvs={cvOptionsQuery.data ?? []}
      defaultProvider={aiProvider}
      defaultModel={aiModel}
      hasAIApiKey={hasAIApiKey}
      isCreating={mutations.createAnalysis.isPending}
      isUploading={mutations.uploadCV.isPending}
      isScoring={mutations.scoreAnalysis.isPending}
      error={newFlowError}
      onCreateCV={createCV}
      onRunIntegrated={runNewIntegratedAnalysis}
      onOpenCopyPaste={openNewCopyPasteFlow}
      onOpenSettings={onOpenSettings}
    />
  );

  return (
    <FeatureScreenShell
      title={listT("jobTitle")}
      mobileBackActive={(view === "list" && Boolean(analysisId)) || mode === "new"}
      onMobileBack={clearSelection}
      bodyContentClassName={view === "kanban" && !analysisId ? "max-w-none" : undefined}
      actions={
        <JobMatchAnalysisHeaderActions
          view={view}
          analysisId={analysisId}
          listLabel={kanbanT("listView")}
          boardLabel={kanbanT("boardView")}
          newOfferLabel={listT("newOffer")}
          deleteOfferLabel={listT("deleteOffer")}
          exportLabel={scoreT("export")}
          isDeleting={mutations.deleteAnalysis.isPending}
          onExport={hasScore ? exportAnalysis : undefined}
          onListView={goToListView}
          onBoardView={goToBoard}
          onNewOffer={goToNew}
          onDelete={() => void deleteSelected()}
        />
      }
    >
      <JobMatchAnalysisBody
        mode={mode}
        view={view}
        analysisId={analysisId}
        newFlow={newFlow}
        detailContent={detailContent}
        analyses={filteredAnalyses}
        selectedId={selectedIdInCurrentList}
        searchQuery={searchQuery}
        searchPlaceholder={listT("searchOffers")}
        backToBoardLabel={kanbanT("backToBoard")}
        isListLoading={isResolvingList}
        isMoving={mutations.moveAnalysisCard.isPending}
        onSearchChange={setSearchQuery}
        onSelect={selectItem}
        onDeleteFromKanban={(id) => void deleteFromKanban(id)}
        onMoveCard={moveKanbanCard}
        onBackToBoard={goToBoard}
      />
      <PendingJobMatchCopyPasteModal
        analysis={pendingCopyPasteAnalysis}
        onClose={() => setPendingCopyPasteAnalysis(null)}
        onApplied={(updated) => {
          applyCopyPasteResult(updated);
          setPendingCopyPasteAnalysis(null);
        }}
      />
    </FeatureScreenShell>
  );
}
