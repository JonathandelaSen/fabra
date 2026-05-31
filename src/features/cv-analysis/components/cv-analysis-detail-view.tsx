"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureDetailTabBar } from "@/components/shared/feature-detail-tab-bar";
import type {
  AIContext,
  AnalysisMode,
  OfferStatus,
} from "@/lib/analysis-types";
import type { InterviewQuestionResponse as InterviewQuestionSummary } from "@/app/api/interview-questions/responses";
import { AnalysisDetailSkeleton } from "@/components/shared/skeletons";
import AIAnalysisView from "./analysis-view";
import ExtractionView from "./extraction-view";

export type CVAnalysisDetailTab = "extraction" | "analysis";

export interface CVAnalysisDetail {
  id: string;
  cv_id: string | null;
  cv: {
    id: string;
    name: string;
    filename: string;
    type?: string;
  } | null;
  title: string;
  filename: string;
  file_size: number | null;
  created_at: string;
  updated_at: string;
  text_python: string | null;
  text_pdfjs: string | null;
  text_node: string | null;
  extract_error_python: string | null;
  extract_error_pdfjs: string | null;
  extract_error_node: string | null;
  analysis_mode: AnalysisMode;
  ai_model: string | null;
  job_description: string | null;
  job_url: string | null;
  offer_status: OfferStatus | null;
  offer_notes: string | null;
  offer_next_action: string | null;
  offer_next_action_at: string | null;
  ai_context: AIContext | null;
  ai_score: number | null;
  ai_feedback: string | null;
  ai_keywords: string | null;
  ai_improvements: string | null;
  job_key_data: string | null;
  job_keywords: string | null;
  cv_keywords: string | null;
  matching_keywords: string | null;
  missing_keywords: string | null;
  ai_analyzed_at: string | null;
}

import type { StoredAIProvider } from "@/lib/browser-preferences";

interface CVAnalysisDetailViewProps {
  analysis: CVAnalysisDetail | null;
  loading: boolean;
  activeTab: CVAnalysisDetailTab;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  interviewQuestions: InterviewQuestionSummary[];
  onTabChange: (tab: CVAnalysisDetailTab) => void;
  onAIAnalysisComplete: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string) => void;
  onInterviewQuestionCreated: () => void;
  onOpenQuestions: (options: {
    cvId?: string | null;
    analysisId?: string | null;
  }) => void;
  onOpenSettings: () => void;
}

export default function CVAnalysisDetailView({
  analysis,
  loading,
  activeTab,
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  interviewQuestions,
  onTabChange,
  onAIAnalysisComplete,
  onDelete,
  onUpdate,
  onInterviewQuestionCreated,
  onOpenQuestions,
  onOpenSettings,
}: CVAnalysisDetailViewProps) {
  const t = useTranslations("analysisFlow.appShell");

  if (loading) {
    return (
      <div key="loading" className="flex-1 overflow-y-auto p-6">
        <AnalysisDetailSkeleton />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div key="empty" className="flex-1 flex items-center justify-center">
        <div className="text-center text-zinc-600">
          <p>{t("empty")}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "extraction" as const, label: t("extractionTab"), icon: <FileText /> },
    { id: "analysis" as const, label: t("analysisTab"), icon: <Sparkles /> },
  ];

  return (
    <div
      key={analysis.id}
      className="flex-1 flex flex-col overflow-hidden min-h-0"
    >
      <FeatureDetailTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      <AnimatePresence mode="wait">
        {activeTab === "extraction" ? (
          <motion.div
            key="extraction-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden min-h-0"
          >
            <ExtractionView
              analysis={analysis}
              onAIAnalysisComplete={onAIAnalysisComplete}
              aiProvider={aiProvider}
              aiApiKey={aiApiKey}
              aiModel={aiModel}
              hasAIApiKey={hasAIApiKey}
              onOpenSettings={onOpenSettings}
              hideAnalysisSelector={true}
            />
          </motion.div>
        ) : analysis.ai_score !== null ? (
          <motion.div
            key="analysis-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden min-h-0"
          >
            <AIAnalysisView
              analysis={{
                ai_score: analysis.ai_score,
                ai_feedback: analysis.ai_feedback!,
                ai_keywords: analysis.ai_keywords!,
                ai_improvements: analysis.ai_improvements!,
                ai_model: analysis.ai_model!,
                ai_analyzed_at: analysis.ai_analyzed_at!,
                analysis_mode: analysis.analysis_mode,
                job_description: analysis.job_description,
                job_url: analysis.job_url,
                offer_status: analysis.offer_status,
                offer_notes: analysis.offer_notes,
                offer_next_action: analysis.offer_next_action,
                offer_next_action_at: analysis.offer_next_action_at,
                ai_context: analysis.ai_context,
                job_key_data: analysis.job_key_data,
                job_keywords: analysis.job_keywords,
                cv_keywords: analysis.cv_keywords,
                matching_keywords: analysis.matching_keywords,
                missing_keywords: analysis.missing_keywords,
                id: analysis.id,
                cv_id: analysis.cv_id,
                cv: analysis.cv,
                title: analysis.title,
                filename: analysis.filename,
              }}
              aiProvider={aiProvider}
              aiApiKey={aiApiKey}
              aiModel={aiModel}
              hasAIApiKey={hasAIApiKey}
              onDelete={onDelete}
              onUpdate={() => onUpdate(analysis.id)}
              interviewQuestions={interviewQuestions.filter(
                (question) => question.analysisId === analysis.id,
              )}
              onInterviewQuestionCreated={onInterviewQuestionCreated}
              onOpenQuestions={() =>
                onOpenQuestions({
                  cvId: analysis.cv_id,
                  analysisId: analysis.id,
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
              analysis={analysis}
              onAIAnalysisComplete={onAIAnalysisComplete}
              aiProvider={aiProvider}
              aiApiKey={aiApiKey}
              aiModel={aiModel}
              hasAIApiKey={hasAIApiKey}
              onOpenSettings={onOpenSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
