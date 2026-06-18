"use client";

import { useTranslations } from "next-intl";
import CopyPasteWorkflowModal from "@/components/shared/copy-paste-workflow-modal";
import type { SelfAssessmentCopyPasteResponse } from "../api/performance-review-api";
import {
  useSelfAssessmentCopyPaste,
  type SelfAssessmentPreview,
} from "../hooks/use-self-assessment-copy-paste";

interface ReviewCopyPasteModalProps {
  open: boolean;
  onClose: () => void;
  onPrepare: () => Promise<SelfAssessmentCopyPasteResponse>;
  onApply: (envelope: unknown) => Promise<unknown>;
}

export function ReviewCopyPasteModal({
  open,
  onClose,
  onPrepare,
  onApply,
}: ReviewCopyPasteModalProps) {
  const t = useTranslations("performanceReview.copyPaste");
  const state = useSelfAssessmentCopyPaste({ onPrepare, onApply, onClose });

  return (
    <CopyPasteWorkflowModal<SelfAssessmentPreview>
      open={open}
      onClose={onClose}
      title={t("title")}
      intro={t("intro")}
      step={state.step}
      onStepChange={state.setStep}
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
      renderPreview={(data) => <SelfAssessmentCopyPastePreview data={data} />}
      getApplyLabel={() => t("apply")}
      isApplying={state.isApplying}
      onApply={state.applyResult}
      error={state.error}
      copiedCorrection={state.copiedCorrection}
      onCopyCorrection={state.copyCorrection}
    />
  );
}

function SelfAssessmentCopyPastePreview({
  data,
}: {
  data: SelfAssessmentPreview;
}) {
  const t = useTranslations("performanceReview.copyPaste");
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase text-text-muted">
        {t("previewTitle")}
      </p>
      <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-line/10 bg-panel/[0.03] p-4 text-sm leading-relaxed text-text-soft">
        {data.content}
      </div>
    </div>
  );
}
