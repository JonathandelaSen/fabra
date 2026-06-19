"use client";

import {
  applyJobMatchAnalysisCopyPaste,
  prepareJobMatchAnalysisCopyPaste,
  previewJobMatchAnalysisCopyPaste,
} from "../api/job-match-analysis-copy-paste-api";

export function useJobMatchAnalysisCopyPaste() {
  return {
    prepareJobMatchAnalysisCopyPaste,
    previewJobMatchAnalysisCopyPaste,
    applyJobMatchAnalysisCopyPaste,
  };
}
