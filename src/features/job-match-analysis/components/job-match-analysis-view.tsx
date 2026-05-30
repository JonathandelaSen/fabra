"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { DeleteButton } from "@/components/shared/action-buttons";
import type { OfferStatus } from "@/lib/analysis-types";
import type { InterviewQuestionSummary } from "../types";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import {
  useJobMatchAnalysisList,
  useJobMatchAnalysisDetail,
} from "../hooks/use-job-match-analysis-queries";
import { useJobMatchAnalysisMutations } from "../hooks/use-job-match-analysis-mutations";
import { useJobMatchAnalysisRouteState } from "../hooks/use-job-match-analysis-route-state";
import { useJobMatchCopyPasteApplied } from "../hooks/use-job-match-copy-paste-applied";
import JobMatchAnalysisList from "./job-match-analysis-list";
import { JobMatchAnalysisContent } from "./job-match-analysis-content";

interface JobMatchAnalysisViewProps {
  aiProvider: "gemini" | "mock";
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
  const alertsT = useTranslations("analysisFlow.alerts");
  const routeState = useJobMatchAnalysisRouteState();
  const listQuery = useJobMatchAnalysisList();
  const mutations = useJobMatchAnalysisMutations();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    analysisId,
    isAnalysisView,
    analysisTab,
    selectAnalysis,
    clearSelection,
    replaceAnalysis,
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
    if (!analysisId && analyses[0]?.id) {
      replaceAnalysis(analyses[0].id);
    }
  }, [analysisId, analyses, replaceAnalysis]);

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
    input: { jobDescription: string; jobUrl: string; model: string },
  ) => {
    if (!analysisId) return;
    await mutations.scoreAnalysis.mutateAsync({
      id: analysisId,
      input: {
        provider: aiProvider,
        apiKey: aiApiKey,
        model: input.model,
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

  return (
    <FeatureScreenShell
      title={listT("jobTitle")}
      actions={
        <>
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
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
