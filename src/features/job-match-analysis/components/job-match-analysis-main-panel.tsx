"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureDetailTabBar } from "@/components/shared/feature-detail-tab-bar";
import type { OfferStatus } from "@/lib/analysis-types";
import type { InterviewQuestionSummary, JobMatchAnalysisDetailResponse } from "../types";
import type { AnalysisTab } from "../hooks/use-job-match-analysis-route-state";
import JobMatchAnalysisDetail from "./job-match-analysis-detail";
import JobMatchExtractionView from "./job-match-extraction-view";

interface JobMatchAnalysisMainPanelProps {
  detail: JobMatchAnalysisDetailResponse;
  isAnalysisView: boolean;
  hasScore: boolean;
  analysisTab: AnalysisTab;
  aiApiKey: string;
  hasAIApiKey: boolean;
  filteredInterviewQuestions: InterviewQuestionSummary[];
  onCopyPasteApplied: (updated: JobMatchAnalysisDetailResponse) => void;
  onOpenQuestions: () => void;
  onOpenSettings: () => void;
  onScore: (input: {
    jobDescription: string;
    jobUrl: string;
    model: string;
  }) => Promise<void>;
  onTabChange: (tab: AnalysisTab) => void;
  onViewModeChange: (tab: "analysis" | "extraction") => void;
  onInterviewQuestionCreated?: () => void;
  onUpdateUrl: (url: string) => Promise<void>;
  onUpdateTracking: (updates: {
    offerStatus: OfferStatus;
    offerNotes: string;
    offerNextAction: string;
    offerNextActionAt: string;
  }) => Promise<void>;
}

export function JobMatchAnalysisMainPanel({
  detail,
  isAnalysisView,
  hasScore,
  analysisTab,
  aiApiKey,
  hasAIApiKey,
  filteredInterviewQuestions,
  onCopyPasteApplied,
  onOpenQuestions,
  onOpenSettings,
  onScore,
  onTabChange,
  onViewModeChange,
  onInterviewQuestionCreated,
  onUpdateUrl,
  onUpdateTracking,
}: JobMatchAnalysisMainPanelProps) {
  const t = useTranslations("analysisFlow.appShell");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <FeatureDetailTabBar
        tabs={[
          { id: "extraction" as const, label: t("extractionTab"), icon: <FileText /> },
          { id: "analysis" as const, label: t("analysisTab"), icon: <Sparkles /> },
        ]}
        activeTab={isAnalysisView ? "analysis" : "extraction"}
        onTabChange={onViewModeChange}
      />

      <AnimatePresence mode="wait">
        {!isAnalysisView ? (
          <motion.div
            key="extraction-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <JobMatchExtractionView
              analysis={detail}
              onScore={onScore}
              hasAIApiKey={hasAIApiKey}
              onOpenSettings={onOpenSettings}
              onCopyPasteApplied={onCopyPasteApplied}
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
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <JobMatchAnalysisDetail
              analysis={detail}
              aiApiKey={aiApiKey}
              hasAIApiKey={hasAIApiKey}
              activeTab={analysisTab}
              onTabChange={onTabChange}
              interviewQuestions={filteredInterviewQuestions}
              onInterviewQuestionCreated={onInterviewQuestionCreated}
              onOpenQuestions={onOpenQuestions}
              onUpdateUrl={onUpdateUrl}
              onUpdateTracking={onUpdateTracking}
            />
          </motion.div>
        ) : (
          <motion.div
            key="analysis-selector-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <JobMatchExtractionView
              analysis={detail}
              onScore={onScore}
              hasAIApiKey={hasAIApiKey}
              onOpenSettings={onOpenSettings}
              onCopyPasteApplied={onCopyPasteApplied}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
