"use client";

import { useCopyPasteWorkflowState } from "@/frontend/components/shared/use-copy-paste-workflow-state";
import type { ApplyCVEditorCopyPasteResponse } from "../types";
import {
  applyCVEditorCopyPaste,
  prepareCVEditorCopyPaste,
  previewCVEditorCopyPaste,
} from "../api/cv-editor-copy-paste-api";

const CORRECTION_INSTRUCTIONS =
  "Please return only the required JSON envelope. Do not include Markdown or explanation outside JSON. Keep workflowId as cv_editor.apply_instruction and schemaVersion as 1.";

export function useCVEditorCopyPasteWorkflow({
  cvId,
  instruction,
  open,
  onApplied,
  onClose,
}: {
  cvId: string;
  instruction: string;
  open: boolean;
  onApplied: (result: ApplyCVEditorCopyPasteResponse) => void;
  onClose: () => void;
}) {
  return useCopyPasteWorkflowState({
    open,
    prepare: () => prepareCVEditorCopyPaste(cvId, { instruction }),
    preview: (rawResponse) => previewCVEditorCopyPaste(cvId, { rawResponse }),
    apply: (previewData) =>
      applyCVEditorCopyPaste(cvId, {
        parsedResult: previewData.parsedResult,
      }),
    getCorrectionInstructions: () => CORRECTION_INSTRUCTIONS,
    onApplied: (result) => onApplied(result as ApplyCVEditorCopyPasteResponse),
    onClose,
  });
}
