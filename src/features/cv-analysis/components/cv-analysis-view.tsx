"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { InterviewQuestionResponse as InterviewQuestionSummary } from "@/app/api/interview-questions/responses";
import { AnalysisDetailSkeleton } from "@/components/shared/skeletons";
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
  const route = useCVAnalysisRouteState();
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

  const analyses = analysesQuery.data ?? [];
  const selectedAnalysis = detailQuery.data ?? null;
  const isLoadingList = analysesQuery.isLoading && analyses.length === 0;

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
    if (route.analysisId === id) {
      if (nextAnalysis) {
        route.goToDetail(nextAnalysis.id);
      } else {
        route.goToList();
      }
    }
    await deleteAnalysis.mutateAsync(id);
  };

  if (route.mode === "new") {
    return (
      <NewAnalysisFlow
        cvs={cvOptionsQuery.data ?? []}
        onCreateCV={handleCreateCV}
        onCreateAnalysis={handleCreateAnalysis}
        onAnalysisCreated={(analysisId) => route.goToDetail(analysisId)}
      />
    );
  }

  if (route.mode === "list") {
    return (
      <CVAnalysesListView
        analyses={analyses}
        isLoading={isLoadingList}
        onSelect={(id) => route.goToDetail(id)}
        onNewAnalysis={route.goToNew}
        onDelete={handleDelete}
      />
    );
  }

  if (detailQuery.isLoading || !selectedAnalysis) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <AnalysisDetailSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {selectedAnalysis.ai_score !== null && (
        <div className="shrink-0 flex items-center gap-1 px-4 sm:px-6 pt-4">
          <button
            onClick={() => route.setTab("extraction")}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
              ${
                route.tab === "extraction"
                  ? "bg-white/[0.08] text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
              }
            `}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t("extractionTab")}
          </button>
          <button
            onClick={() => route.setTab("analysis")}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
              ${
                route.tab === "analysis"
                  ? "bg-white/[0.08] text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
              }
            `}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t("analysisTab")}
          </button>
        </div>
      )}

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
        ) : null}
      </AnimatePresence>
    </div>
  );
}
