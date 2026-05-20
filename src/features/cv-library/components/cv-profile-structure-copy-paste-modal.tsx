"use client";

import { useTranslations } from "next-intl";
import CopyPasteWorkflowModal from "@/components/shared/copy-paste-workflow-modal";
import { useCopyPasteWorkflowState } from "@/components/shared/use-copy-paste-workflow-state";
import type { ApplyCVProfileCopyPasteResponse } from "@/app/api/cvs/[id]/structured-profile/copy-paste/apply/responses";
import type { PreviewCVProfileCopyPasteResponse } from "@/app/api/cvs/[id]/structured-profile/copy-paste/preview/responses";
import type { CVTemplateLocale } from "@/lib/cv-templates";
import {
  applyCVProfileCopyPaste,
  prepareCVProfileCopyPaste,
  previewCVProfileCopyPaste,
} from "../api/cv-profile-copy-paste-api";
import CVProfileCopyPastePreview from "./cv-profile-copy-paste-preview";

const CV_PROFILE_COPY_PASTE_WORKFLOW_ID =
  "cv_profile.structure_for_template";
const CV_PROFILE_COPY_PASTE_SCHEMA_VERSION = "1";
const CV_PROFILE_CORRECTION_INSTRUCTIONS = `Please return only the required JSON envelope. Do not include Markdown or explanation outside JSON. Keep workflowId as ${CV_PROFILE_COPY_PASTE_WORKFLOW_ID} and schemaVersion as ${CV_PROFILE_COPY_PASTE_SCHEMA_VERSION}.`;

interface CVProfileStructureCopyPasteModalProps {
  cvId: string;
  templateId: string;
  locale: CVTemplateLocale;
  open: boolean;
  onClose: () => void;
  onApplied: (result: ApplyCVProfileCopyPasteResponse) => void;
}

export default function CVProfileStructureCopyPasteModal({
  cvId,
  templateId,
  locale,
  open,
  onClose,
  onApplied,
}: CVProfileStructureCopyPasteModalProps) {
  const tProfile = useTranslations("analysisFlow.cvProfileCopyPaste");

  const state = useCopyPasteWorkflowState({
    open,
    prepare: () => prepareCVProfileCopyPaste(cvId, { templateId, locale }),
    preview: (rawResponse) =>
      previewCVProfileCopyPaste(cvId, { rawResponse }),
    apply: (previewData) =>
      applyCVProfileCopyPaste(cvId, {
        parsedResult: previewData.parsedResult,
        templateId,
        locale,
        createTemplateVersion: true,
      }),
    getCorrectionInstructions: () => CV_PROFILE_CORRECTION_INSTRUCTIONS,
    onApplied: (result) => onApplied(result as ApplyCVProfileCopyPasteResponse),
    onClose,
  });

  return (
    <CopyPasteWorkflowModal<
      { prompt: string; privacyNotice: string },
      PreviewCVProfileCopyPasteResponse
    >
      open={open}
      onClose={onClose}
      title={tProfile("title")}
      intro={tProfile("intro")}
      step={state.step}
      onStepChange={state.setStep}
      prepareData={state.prepareData}
      isPreparing={state.isPreparing}
      prompt={state.prompt}
      privacyNotice={state.privacyNotice}
      copiedPrompt={state.copiedPrompt}
      onCopyPrompt={state.copyPrompt}
      rawResponse={state.rawResponse}
      onRawResponseChange={state.setRawResponse}
      isPreviewing={state.isPreviewing}
      onValidateResponse={state.validateResponse}
      previewData={state.previewData}
      renderPreview={(data) => <CVProfileCopyPastePreview data={data} />}
      getApplyLabel={() => tProfile("applyProfile")}
      isApplying={state.isApplying}
      onApply={state.applyResult}
      error={state.error}
      correctionInstructions={CV_PROFILE_CORRECTION_INSTRUCTIONS}
      copiedCorrection={state.copiedCorrection}
      onCopyCorrection={state.copyCorrection}
    />
  );
}
