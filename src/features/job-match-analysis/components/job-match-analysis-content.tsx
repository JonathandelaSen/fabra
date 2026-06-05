"use client";

import { useTranslations } from "next-intl";
import { AnalysisDetailSkeleton } from "@/components/shared/skeletons";
import type { OfferStatus } from "@/lib/analysis-types";
import type { JobMatchAnalysisDetailResponse } from "../types";
import type { AnalysisTab } from "../hooks/use-job-match-analysis-route-state";
import type { InterviewQuestionSummary } from "../types";
import { JobMatchAnalysisMainPanel } from "./job-match-analysis-main-panel";
import type { StoredAIProvider } from "@/lib/browser-preferences";

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
}: JobMatchAnalysisContentProps) {
  const t = useTranslations("analysisFlow.appShell");

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <AnalysisDetailSkeleton />
      </div>
    );
  }

  if (!analysisId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-600">
        {t("empty")}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-zinc-600">
          <p>{t("empty")}</p>
        </div>
      </div>
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
