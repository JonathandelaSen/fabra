"use client";

import { useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useIsDesktopLayout } from "@/frontend/components/shared/use-is-desktop-layout";
import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeatureDetailTabBar } from "@/frontend/components/shared/feature-detail-tab-bar";
import type { InterviewQuestionSummary, JobMatchAnalysisDetailResponse, JobMatchViewMode } from "../types";
import { JOB_MATCH_VIEW_MODES } from "../constants";
import type { AnalysisTab } from "../hooks/use-job-match-analysis-route-state";
import JobMatchAnalysisDetail from "./detail/job-match-analysis-detail";
import { JobMatchAnalysisGeneratingState } from "./detail/job-match-analysis-generating-state";
import JobMatchExtractionView from "./extraction/job-match-extraction-view";
import { PendingJobMatchAnalysisView } from "./extraction/pending-job-match-analysis-view";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";
import type {
  CreateFollowUpEntryInput,
  FollowUpEntryInput,
} from "../api/job-match-analysis-api";

interface JobMatchAnalysisMainPanelProps {
  detail: JobMatchAnalysisDetailResponse;
  isAnalysisView: boolean;
  hasScore: boolean;
  isGeneratingAnalysis: boolean;
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
    provider: StoredAIProvider;
    model: string;
  }) => Promise<void>;
  onTabChange: (tab: AnalysisTab) => void;
  onViewModeChange: (tab: JobMatchViewMode) => void;
  onInterviewQuestionCreated?: () => void;
  onUpdateUrl: (url: string) => Promise<void>;
  isSavingTracking: boolean;
  onCreateTrackingEntry: (input: CreateFollowUpEntryInput) => Promise<void>;
  onUpdateTrackingEntry: (entryId: string, input: FollowUpEntryInput) => Promise<void>;
  onDeleteTrackingEntry: (entryId: string) => Promise<void>;
}

export function JobMatchAnalysisMainPanel({
  detail,
  isAnalysisView,
  hasScore,
  isGeneratingAnalysis,
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
  isSavingTracking,
  onCreateTrackingEntry,
  onUpdateTrackingEntry,
  onDeleteTrackingEntry,
}: JobMatchAnalysisMainPanelProps) {
  const t = useTranslations("analysisFlow.appShell");
  const [prevId, setPrevId] = useState(detail.id);
  const [prevIsAnalysisView, setPrevIsAnalysisView] = useState(isAnalysisView);
  const [activeView, setActiveView] = useState<JobMatchViewMode>(
    isAnalysisView ? JOB_MATCH_VIEW_MODES.analysis : JOB_MATCH_VIEW_MODES.extraction,
  );

  if (detail.id !== prevId || isAnalysisView !== prevIsAnalysisView) {
    setPrevId(detail.id);
    setPrevIsAnalysisView(isAnalysisView);
    setActiveView(isAnalysisView ? JOB_MATCH_VIEW_MODES.analysis : JOB_MATCH_VIEW_MODES.extraction);
  }

  const handleViewModeChange = (view: JobMatchViewMode) => {
    setActiveView(view);
    onViewModeChange(view);
  };

  const isDesktop = useIsDesktopLayout();

  return (
    <MotionConfig reducedMotion={isDesktop ? "always" : "never"}>
      <div className="flex flex-col">
      <FeatureDetailTabBar
        tabs={[
          { id: JOB_MATCH_VIEW_MODES.extraction, label: t("extractionTab"), icon: <FileText /> },
          { id: JOB_MATCH_VIEW_MODES.analysis, label: t("analysisTab"), icon: <Sparkles /> },
        ]}
        activeTab={activeView}
        onTabChange={handleViewModeChange}
      />

      <AnimatePresence mode="wait">
        {activeView === JOB_MATCH_VIEW_MODES.extraction ? (
          <motion.div
            key="extraction-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col"
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
        ) : isGeneratingAnalysis ? (
          <motion.div
            key="generating-analysis-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col"
          >
            <JobMatchAnalysisGeneratingState
              onViewExtraction={() =>
                handleViewModeChange(JOB_MATCH_VIEW_MODES.extraction)
              }
            />
          </motion.div>
        ) : hasScore ? (
          <motion.div
            key="analysis-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col"
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
              isSavingTracking={isSavingTracking}
              onCreateTrackingEntry={onCreateTrackingEntry}
              onUpdateTrackingEntry={onUpdateTrackingEntry}
              onDeleteTrackingEntry={onDeleteTrackingEntry}
            />
          </motion.div>
        ) : (
          <motion.div
            key="pending-analysis-view"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col"
          >
            <PendingJobMatchAnalysisView
              analysisId={detail.id}
              hasAIApiKey={hasAIApiKey}
              onCopyPasteApplied={onCopyPasteApplied}
              onOpenSettings={onOpenSettings}
              onScore={onScore}
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
