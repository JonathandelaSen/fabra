"use client";

import { useTranslations } from "next-intl";
import { JobMatchAnalysisDetailSkeleton } from "./detail/job-match-analysis-detail-skeleton";
import { FeatureDetailTabBar } from "@/frontend/components/shared/feature-detail-tab-bar";
import { FileText, Sparkles, Briefcase, Plus } from "lucide-react";
import type { OfferStatus } from "@/lib/analysis-types";
import type { JobMatchAnalysisDetailResponse, JobMatchViewMode, InterviewQuestionSummary } from "../types";
import type { AnalysisTab } from "../hooks/use-job-match-analysis-route-state";
import { JOB_MATCH_VIEW_MODES } from "../constants";
import { JobMatchAnalysisMainPanel } from "./job-match-analysis-main-panel";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";
import { IconTextButton, ICON_TEXT_BUTTON_TONES } from "@/frontend/components/shared/action-buttons";
import { FeatureEmptyState } from "@/frontend/components/shared/feature-empty-state";

interface JobMatchAnalysisContentProps {
  analysisId: string | null;
  detail: JobMatchAnalysisDetailResponse | null;
  isLoading: boolean;
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
    provider: StoredAIProvider;
    model: string;
  }) => Promise<void>;
  onTabChange: (tab: AnalysisTab) => void;
  onViewModeChange: (tab: JobMatchViewMode) => void;
  onInterviewQuestionCreated?: () => void;
  onUpdateUrl: (url: string) => Promise<void>;
  onUpdateTracking: (updates: {
    offerStatus: OfferStatus;
    offerNotes: string;
    offerNextAction: string;
    offerNextActionAt: string;
  }) => Promise<void>;
  onCreate?: () => void;
  analysesCount?: number;
}

export function JobMatchAnalysisContent({
  analysisId,
  detail,
  isLoading,
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
  onCreate,
  analysesCount = 0,
}: JobMatchAnalysisContentProps) {
  const t = useTranslations("analysisFlow.appShell");
  const tLists = useTranslations("analysisFlow.lists");

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <FeatureDetailTabBar
          tabs={[
            { id: JOB_MATCH_VIEW_MODES.extraction, label: t("extractionTab"), icon: <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
            { id: JOB_MATCH_VIEW_MODES.analysis, label: t("analysisTab"), icon: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
          ]}
          activeTab={JOB_MATCH_VIEW_MODES.analysis}
          onTabChange={() => {}}
        />
        <div className="flex-1 py-4 sm:py-6">
          <JobMatchAnalysisDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!analysisId || !detail) {
    const title = analysesCount === 0 ? tLists("jobEmptyTitle") : t("empty");
    return (
      <FeatureEmptyState
        icon={Briefcase}
        title={title}
        action={
          onCreate && (
            <IconTextButton
              icon={Plus}
              tone={ICON_TEXT_BUTTON_TONES.PRIMARY}
              onClick={onCreate}
            >
              {tLists("newOffer")}
            </IconTextButton>
          )
        }
      />
    );
  }

  return (
    <JobMatchAnalysisMainPanel
      detail={detail}
      isAnalysisView={isAnalysisView}
      hasScore={hasScore}
      analysisTab={analysisTab}
      aiApiKey={aiApiKey}
      hasAIApiKey={hasAIApiKey}
      filteredInterviewQuestions={filteredInterviewQuestions}
      onCopyPasteApplied={onCopyPasteApplied}
      onOpenQuestions={onOpenQuestions}
      onOpenSettings={onOpenSettings}
      onScore={onScore}
      onTabChange={onTabChange}
      onViewModeChange={onViewModeChange}
      onInterviewQuestionCreated={onInterviewQuestionCreated}
      onUpdateUrl={onUpdateUrl}
      onUpdateTracking={onUpdateTracking}
    />
  );
}
