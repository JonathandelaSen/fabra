"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureDetailTabBar } from "@/components/shared/feature-detail-tab-bar";
import type { AIContext, Analysis } from "@/lib/analysis-types";
import type { InterviewQuestionSummary } from "../types";
import type { ScoreCVAnalysisInput } from "../hooks/use-cv-analysis-mutations";
import type { useCVAnalysisRouteState } from "../hooks/use-cv-analysis-route-state";
import AIAnalysisView from "./analysis-view";
import ExtractionView from "./extraction-view";
import type { StoredAIProvider } from "@/lib/browser-preferences";

interface CVAnalysisDetailPanelProps {
  selectedAnalysis: Analysis;
  route: ReturnType<typeof useCVAnalysisRouteState>;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  interviewQuestions: InterviewQuestionSummary[];
  onDelete: (id: string) => Promise<void>;
  onOpenSettings: () => void;
  onOpenQuestions: (options?: {
    cvId?: string | null;
    analysisId?: string | null;
  }) => void;
  onRefetchAnalysis: () => void;
  onRefetchQuestions: () => void;
  onScoreAnalysis: (id: string, input: ScoreCVAnalysisInput) => Promise<void>;
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

function toExtractionAnalysis(analysis: Analysis) {
  return {
    ...analysis,
    cv: analysis.cv
      ? {
          id: analysis.cv.id,
          name: analysis.cv.name,
          filename: analysis.cv.filename ?? "",
          type: analysis.cv.type,
        }
      : null,
  };
}

export function CVAnalysisDetailPanel({
  selectedAnalysis,
  route,
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  interviewQuestions,
  onDelete,
  onOpenSettings,
  onOpenQuestions,
  onRefetchAnalysis,
  onRefetchQuestions,
  onScoreAnalysis,
}: CVAnalysisDetailPanelProps) {
  const t = useTranslations("analysisFlow.appShell");
  const extractionAnalysis = toExtractionAnalysis(selectedAnalysis);
  const hasAnalysis = selectedAnalysis.ai_score !== null;
  const effectiveTab = hasAnalysis
    ? (route.tab ?? "analysis")
    : "extraction";
  const handleAnalysisComplete = () => {
    onRefetchAnalysis();
    route.setTab("analysis");
  };

  return (
    <div className="flex flex-col">
      <FeatureDetailTabBar
        tabs={[
          { id: "extraction" as const, label: t("extractionTab"), icon: <FileText /> },
          ...(hasAnalysis
            ? [
                {
                  id: "analysis" as const,
                  label: t("analysisTab"),
                  icon: <Sparkles />,
                },
              ]
            : []),
        ]}
        activeTab={effectiveTab}
        onTabChange={(tab) => route.setTab(tab)}
      />

      <AnimatePresence mode="wait">
        {effectiveTab === "extraction" ? (
          <motion.div
            key="extraction-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col"
          >
            <ExtractionView
              analysis={extractionAnalysis}
              onAIAnalysisComplete={handleAnalysisComplete}
              aiProvider={aiProvider}
              aiApiKey={aiApiKey}
              aiModel={aiModel}
              hasAIApiKey={hasAIApiKey}
              onOpenSettings={onOpenSettings}
              onScoreAnalysis={onScoreAnalysis}
              hideAnalysisSelector={hasAnalysis}
            />
          </motion.div>
        ) : (
          <motion.div
            key="analysis-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col"
          >
            <AIAnalysisView
              analysis={toAIAnalysisProps(selectedAnalysis)}
              aiProvider={aiProvider}
              aiApiKey={aiApiKey}
              aiModel={aiModel}
              hasAIApiKey={hasAIApiKey}
              onDelete={onDelete}
              onUpdate={onRefetchAnalysis}
              interviewQuestions={interviewQuestions}
              onInterviewQuestionCreated={onRefetchQuestions}
              onOpenQuestions={() =>
                onOpenQuestions({
                  cvId: selectedAnalysis.cv_id,
                  analysisId: selectedAnalysis.id,
                })
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
