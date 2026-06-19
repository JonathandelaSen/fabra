"use client";

import type { JobMatchAnalysisDetailResponse } from "../../types";
import JobMatchScoreCopyPasteModal from "./job-match-score-copy-paste-modal";

interface PendingJobMatchCopyPasteModalProps {
  analysis: JobMatchAnalysisDetailResponse | null;
  onClose: () => void;
  onApplied: (analysis: JobMatchAnalysisDetailResponse) => void;
}

export function PendingJobMatchCopyPasteModal({
  analysis,
  onClose,
  onApplied,
}: PendingJobMatchCopyPasteModalProps) {
  if (!analysis) return null;

  return (
    <JobMatchScoreCopyPasteModal
      analysisId={analysis.id}
      jobDescription={analysis.jobDescription ?? ""}
      jobUrl={analysis.jobUrl}
      open={Boolean(analysis)}
      onClose={onClose}
      onApplied={onApplied}
    />
  );
}
