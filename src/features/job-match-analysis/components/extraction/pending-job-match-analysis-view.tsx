"use client";

import type { ComponentProps } from "react";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import { useJobMatchScoringState } from "../../hooks/use-job-match-scoring-state";
import JobMatchForm from "./job-match-form";
import JobMatchScoreCopyPasteModal from "../copy-paste/job-match-score-copy-paste-modal";

interface PendingJobMatchAnalysisViewProps {
  analysisId: string;
  hasAIApiKey: boolean;
  onCopyPasteApplied: ComponentProps<typeof JobMatchScoreCopyPasteModal>["onApplied"];
  onOpenSettings: () => void;
  onScore: (input: {
    jobDescription: string;
    jobUrl: string;
    provider: StoredAIProvider;
    model: string;
  }) => Promise<void>;
}

export function PendingJobMatchAnalysisView({
  analysisId,
  hasAIApiKey,
  onCopyPasteApplied,
  onOpenSettings,
  onScore,
}: PendingJobMatchAnalysisViewProps) {
  const scoring = useJobMatchScoringState({ onScore, hasAIApiKey });

  return (
    <div className="py-4 sm:py-6">
      <JobMatchForm
        onSubmit={scoring.handleJobMatchAnalysis}
        onBack={() => {}}
        loading={scoring.loadingAI}
        error={scoring.aiError}
        hasAIApiKey={hasAIApiKey}
        onOpenSettings={onOpenSettings}
        onCopyPasteOpen={(description, url) =>
          scoring.openCopyPaste(description, url || null)
        }
      />

      <JobMatchScoreCopyPasteModal
        analysisId={analysisId}
        jobDescription={scoring.copyPasteJobDescription}
        jobUrl={scoring.copyPasteJobUrl}
        open={scoring.copyPasteOpen}
        onClose={scoring.closeCopyPaste}
        onApplied={onCopyPasteApplied}
      />
    </div>
  );
}
