"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Plus, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureDetailTabBar } from "@/components/shared/feature-detail-tab-bar";
import type { InterviewQuestionResponse as InterviewQuestionSummary } from "@/app/api/interview-questions/responses";
import { FeatureScreenShell } from "@/components/shared/feature-screen-shell";
import { FeatureTwoPaneLayout } from "@/components/shared/feature-two-pane-layout";
import { AnalysisDetailSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import type { AIContext, Analysis } from "@/lib/analysis-types";
import {
  useCreateCVAnalysis,
  useDeleteCVAnalysis,
  useScoreCVAnalysis,
  useUploadCVForAnalysis,
  type CreateCVAnalysisInput,
  type ScoreCVAnalysisInput,
} from "../hooks/use-cv-analysis-mutations";
import {
  useCVAnalysesList,
  useCVAnalysisCVOptions,
  useCVAnalysisDetail,
  useCVAnalysisInterviewQuestions,
} from "../hooks/use-cv-analysis-queries";
import { useCVAnalysisRouteState } from "../hooks/use-cv-analysis-route-state";
import AIAnalysisView from "./analysis-view";
import CVAnalysesListView from "./cv-analyses-list-view";
import ExtractionView from "./extraction-view";
import NewAnalysisFlow from "./new-analysis-flow";

interface CVAnalysisViewProps {
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onOpenQuestions: (options?: {
    cvId?: string | null;
    analysisId?: string | null;
  }) => void;
}

function toAIAnalysisProps(analysis: Analysis) {
  return {
    ai_score: analysis.ai_score ?? 0,
    ai_feedback: analysis.ai_feedback ?? "",
    ai_keywords: analysis.ai_keywords ?? "[]",
    ai_improvements: analysis.ai_improvements ?? "[]",
    ai_model: analysis.ai_model ?? "",
    ai_analyzed_at: analysis.ai_analyzed_at ?? "",
    analysis_mode: analysis.analysis_mode,
    job_description: analysis.job_description,
    job_url: analysis.job_url,
    offer_status: analysis.offer_status,
    offer_notes: analysis.offer_notes,
    offer_next_action: analysis.offer_next_action,
    offer_next_action_at: analysis.offer_next_action_at,
    ai_context: (analysis.ai_context as AIContext | null) ?? null,
    job_key_data: analysis.job_key_data,
    job_keywords: analysis.job_keywords,
    cv_keywords: analysis.cv_keywords,
    matching_keywords: analysis.matching_keywords,
    missing_keywords: analysis.missing_keywords,
    id: analysis.id,
    cv_id: analysis.cv_id,
    cv: analysis.cv
      ? {
          id: analysis.cv.id,
          name: analysis.cv.name,
          filename: analysis.cv.filename ?? "",
          type: analysis.cv.type,
        }
      : null,
    title: analysis.title,
    filename: analysis.filename,
  };
}

export default function CVAnalysisView({
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
  onOpenQuestions,
}: CVAnalysisViewProps) {
  const t = useTranslations("analysisFlow.appShell");
  const listT = useTranslations("analysisFlow.lists");
  const route = useCVAnalysisRouteState();
  const [searchQuery, setSearchQuery] = useState("");
  const analysesQuery = useCVAnalysesList();
  const cvOptionsQuery = useCVAnalysisCVOptions();
  const detailQuery = useCVAnalysisDetail(route.analysisId);
  const interviewQuestionsQuery = useCVAnalysisInterviewQuestions(
    route.analysisId,
  );
  const createAnalysis = useCreateCVAnalysis();
  const uploadCV = useUploadCVForAnalysis();
  const scoreAnalysis = useScoreCVAnalysis();
  const deleteAnalysis = useDeleteCVAnalysis();

  const analyses = useMemo(() => analysesQuery.data ?? [], [analysesQuery.data]);
  const filteredAnalyses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return analyses;
    return analyses.filter((analysis) => {
      const title = analysis.title || analysis.filename.replace(/\.pdf$/i, "");
      return title.toLowerCase().includes(query);
    });
  }, [analyses, searchQuery]);
  const selectedAnalysis = detailQuery.data ?? null;
  const selectedIdInCurrentList =
    filteredAnalyses.find((analysis) => analysis.id === route.analysisId)?.id ?? null;
  const isLoadingList = analysesQuery.isLoading && analyses.length === 0;

  useEffect(() => {
    if (route.mode === "list" && analyses[0]?.id) {
      route.replaceDetail(analyses[0].id);
    }
  }, [analyses, route]);

  const handleCreateCV = async (file: File, name: string) => {
    const cv = await uploadCV.mutateAsync({ file, name });
    return cv.id;
  };

  const handleCreateAnalysis = async (input: CreateCVAnalysisInput) => {
    const analysis = await createAnalysis.mutateAsync({
      model: aiModel,
      ...input,
    });
    return analysis.id;
  };

  const handleScoreAnalysis = async (
    id: string,
    input: ScoreCVAnalysisInput,
  ) => {
    await scoreAnalysis.mutateAsync({ id, input });
  };

  const handleDelete = async (id: string) => {
    const currentIndex = analyses.findIndex((analysis) => analysis.id === id);
    const nextAnalysis =
      analyses[currentIndex + 1] ?? analyses[currentIndex - 1] ?? null;
    await deleteAnalysis.mutateAsync(id);
    if (route.analysisId === id) {
      if (nextAnalysis) {
        route.replaceDetail(nextAnalysis.id);
      } else {
        route.goToList();
      }
    }
  }

  return (
    <FeatureScreenShell
      title={listT("cvTitle")}
      actions={
        <Button
          type="button"
          onClick={route.goToNew}
          className="bg-indigo-300 text-indigo-950 font-semibold hover:bg-indigo-200 transition-colors shadow-[0_0_30px_rgba(129,140,248,0.15)]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {listT("newAnalysis")}
        </Button>
      }
      contentClassName="max-w-[1560px] mx-auto"
      bodyContentClassName="max-w-[1560px] mx-auto h-full"
    >
      <FeatureTwoPaneLayout
        sidebar={
          <CVAnalysesListView
            analyses={filteredAnalyses}
            selectedId={selectedIdInCurrentList}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isLoading={isLoadingList}
            onSelect={(id) => route.goToDetail(id)}
            onDelete={(id) => void handleDelete(id)}
          />
        }
        mainClassName="overflow-hidden"
      >
        {route.mode === "new" ? (
          <NewAnalysisFlow
            cvs={cvOptionsQuery.data ?? []}
            onCreateCV={handleCreateCV}
            onCreateAnalysis={handleCreateAnalysis}
            onAnalysisCreated={(analysisId) => route.goToDetail(analysisId)}
          />
        ) : isLoadingList || (route.mode === "detail" && detailQuery.isLoading) ? (
          <div className="h-full overflow-y-auto p-6">
            <AnalysisDetailSkeleton />
          </div>
        ) : !selectedAnalysis ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            {t("empty")}
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <FeatureDetailTabBar
              tabs={[
                { id: "extraction" as const, label: t("extractionTab"), icon: <FileText /> },
                { id: "analysis" as const, label: t("analysisTab"), icon: <Sparkles /> },
              ]}
              activeTab={route.tab === "extraction" ? "extraction" : "analysis"}
              onTabChange={(tab) => route.setTab(tab)}
            />

            <AnimatePresence mode="wait">
              {route.tab === "extraction" ? (
                <motion.div
                  key="extraction-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden min-h-0"
                >
                  <ExtractionView
                    analysis={{
                      ...selectedAnalysis,
                      cv: selectedAnalysis.cv
                        ? {
                            id: selectedAnalysis.cv.id,
                            name: selectedAnalysis.cv.name,
                            filename: selectedAnalysis.cv.filename ?? "",
                            type: selectedAnalysis.cv.type,
                          }
                        : null,
                    }}
                    onAIAnalysisComplete={() => {
                      void detailQuery.refetch();
                      route.setTab("analysis");
                    }}
                    aiProvider={aiProvider}
                    aiApiKey={aiApiKey}
                    aiModel={aiModel}
                    hasAIApiKey={hasAIApiKey}
                    onOpenSettings={onOpenSettings}
                    onScoreAnalysis={handleScoreAnalysis}
                    hideAnalysisSelector={true}
                  />
                </motion.div>
              ) : selectedAnalysis.ai_score !== null ? (
                <motion.div
                  key="analysis-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col overflow-hidden min-h-0"
                >
                  <AIAnalysisView
                    analysis={toAIAnalysisProps(selectedAnalysis)}
                    aiProvider={aiProvider}
                    aiApiKey={aiApiKey}
                    aiModel={aiModel}
                    hasAIApiKey={hasAIApiKey}
                    onDelete={handleDelete}
                    onUpdate={() => void detailQuery.refetch()}
                    interviewQuestions={
                      (interviewQuestionsQuery.data ?? []) as InterviewQuestionSummary[]
                    }
                    onInterviewQuestionCreated={() => {
                      void interviewQuestionsQuery.refetch();
                    }}
                    onOpenQuestions={() =>
                      onOpenQuestions({
                        cvId: selectedAnalysis.cv_id,
                        analysisId: selectedAnalysis.id,
                      })
                    }
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
                  <ExtractionView
                    analysis={{
                      ...selectedAnalysis,
                      cv: selectedAnalysis.cv
                        ? {
                            id: selectedAnalysis.cv.id,
                            name: selectedAnalysis.cv.name,
                            filename: selectedAnalysis.cv.filename ?? "",
                            type: selectedAnalysis.cv.type,
                          }
                        : null,
                    }}
                    onAIAnalysisComplete={() => {
                      void detailQuery.refetch();
                      route.setTab("analysis");
                    }}
                    aiProvider={aiProvider}
                    aiApiKey={aiApiKey}
                    aiModel={aiModel}
                    hasAIApiKey={hasAIApiKey}
                    onOpenSettings={onOpenSettings}
                    onScoreAnalysis={handleScoreAnalysis}
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
