"use client";

import {
  applyCVAnalysisCopyPaste,
  prepareCVAnalysisCopyPaste,
  previewCVAnalysisCopyPaste,
} from "../api/cv-analysis-copy-paste-api";

export function useCVAnalysisCopyPaste() {
  return {
    prepareCVAnalysisCopyPaste,
    previewCVAnalysisCopyPaste,
    applyCVAnalysisCopyPaste,
  };
}
