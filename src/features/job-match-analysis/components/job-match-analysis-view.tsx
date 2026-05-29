"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { FeatureHeaderActionButton } from "@/components/shared/feature-header-action-button";
import { FeatureDetailTabBar } from "@/components/shared/feature-detail-tab-bar";
import { DeleteButton } from "@/components/shared/action-buttons";
import type { OfferStatus } from "@/lib/analysis-types";
import type { JobMatchAnalysisDetailResponse } from "@/app/api/job-match-analyses/responses";
import type { InterviewQuestionSummary } from "../types";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { AnalysisDetailSkeleton } from "@/components/shared/skeletons";
import {
  useJobMatchAnalysisList,
  useJobMatchAnalysisDetail,
} from "../hooks/use-job-match-analysis-queries";
import { useJobMatchAnalysisMutations } from "../hooks/use-job-match-analysis-mutations";
import { useJobMatchAnalysisRouteState } from "../hooks/use-job-match-analysis-route-state";
import { jobMatchAnalysisQueryKeys } from "../api/job-match-analysis-query-keys";
import type { ListJobMatchAnalysesResponse } from "@/app/api/job-match-analyses/responses";
import JobMatchAnalysisList from "./job-match-analysis-list";
import JobMatchAnalysisDetail from "./job-match-analysis-detail";
import JobMatchExtractionView from "./job-match-extraction-view";

interface JobMatchAnalysisViewProps {
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onNewAnalysis: () => void;
  onOpenQuestions?: (options?: {
    cvId?: string | null;
    analysisId?: string | null;
  }) => void;
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
  const t = useTranslations("analysisFlow.appShell");
  const listT = useTranslations("analysisFlow.lists");
  const alertsT = useTranslations("analysisFlow.alerts");
  const commonT = useTranslations("common.actions");
  const queryClient = useQueryClient();
  const routeState = useJobMatchAnalysisRouteState();
  const listQuery = useJobMatchAnalysisList();
  const mutations = useJobMatchAnalysisMutations();
  const [searchQuery, setSearchQuery] = useState("");
  const listKey = jobMatchAnalysisQueryKeys.lists();

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

  const handleSelect = (id: string) => {
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

  const handleDeleteSelected = async () => {
    if (!analysisId) return;
    if (!confirm(alertsT("confirmDelete"))) return;

    try {
      await handleDelete(analysisId);
    } catch (error) {
      console.error("Error deleting analysis:", error);
      alert(alertsT("deleteFailed"));
    }
  };

  const handleUpdateUrl = async (url: string) => {
    if (!analysisId) return;
    await mutations.updateAnalysis.mutateAsync({
      id: analysisId,
      updates: { jobUrl: url || null },
    });
  };

  const handleUpdateTracking = async (updates: {
    offerStatus: OfferStatus;
    offerNotes: string;
    offerNextAction: string;
    offerNextActionAt: string;
  }) => {
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

  const handleScore = async (input: {
    jobDescription: string;
    jobUrl: string;
    model: string;
  }) => {
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

  const handleCopyPasteApplied = (updated: JobMatchAnalysisDetailResponse) => {
    queryClient.setQueryData(
      jobMatchAnalysisQueryKeys.detail(updated.id),
      updated,
    );
    queryClient.setQueryData<ListJobMatchAnalysesResponse>(
      listKey,
      (current) =>
        current?.map((item) =>
          item.id === updated.id
            ? {
                ...item,
                aiScore: updated.aiScore,
                aiAnalyzedAt: updated.aiAnalyzedAt,
              }
            : item,
        ) ?? current,
    );
    goToAnalysis("summary");
  };

  const handleOpenQuestions = () => {
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
              onClick={() => void handleDeleteSelected()}
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
            onSelect={handleSelect}
            isLoading={listQuery.isLoading}
          />
        }
        mainClassName="overflow-hidden"
      >
        {!analysisId ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            {t("empty")}
          </div>
        ) : detailQuery.isLoading ? (
          <div className="h-full overflow-y-auto p-6">
            <AnalysisDetailSkeleton />
          </div>
        ) : !detail ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-zinc-600">
              <p>{t("empty")}</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <FeatureDetailTabBar
              tabs={[
                { id: "extraction" as const, label: t("extractionTab"), icon: <FileText /> },
                { id: "analysis" as const, label: t("analysisTab"), icon: <Sparkles /> },
              ]}
              activeTab={isAnalysisView ? "analysis" : "extraction"}
              onTabChange={(tab) => tab === "analysis" ? goToAnalysis() : goToExtraction()}
            />

            <AnimatePresence mode="wait">
              {!isAnalysisView ? (
                <motion.div
                  key="extraction-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden min-h-0"
                >
                  <JobMatchExtractionView
                    analysis={detail}
                    onScore={handleScore}
                    hasAIApiKey={hasAIApiKey}
                    onOpenSettings={onOpenSettings}
                    onCopyPasteApplied={handleCopyPasteApplied}
                    hideAnalysisSelector={true}
                  />
                </motion.div>
              ) : hasScore ? (
                <motion.div
                  key="analysis-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden min-h-0"
                >
                  <JobMatchAnalysisDetail
                    analysis={detail}
                    aiApiKey={aiApiKey}
                    hasAIApiKey={hasAIApiKey}
                    activeTab={analysisTab}
                    onTabChange={setAnalysisTab}
                    interviewQuestions={filteredInterviewQuestions}
                    onInterviewQuestionCreated={onInterviewQuestionCreated}
                    onOpenQuestions={handleOpenQuestions}
                    onUpdateUrl={handleUpdateUrl}
                    onUpdateTracking={handleUpdateTracking}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="analysis-selector-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden min-h-0"
                >
                  <JobMatchExtractionView
                    analysis={detail}
                    onScore={handleScore}
                    hasAIApiKey={hasAIApiKey}
                    onOpenSettings={onOpenSettings}
                    onCopyPasteApplied={handleCopyPasteApplied}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </FeatureTwoPaneLayout>
    </FeatureScreenShell>
  );
}
