"use client";

import { useTranslations } from "next-intl";
import CopyPasteWorkflowModal, {
  CopyPastePreviewItem,
} from "@/components/shared/copy-paste-workflow-modal";
import { useCopyPasteWorkflowState } from "@/components/shared/use-copy-paste-workflow-state";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import type { CVAnalysisDetailResponse } from "@/app/api/cv-analyses/responses";
import type {
  CVAnalysisCopyPasteResult,
  PreviewCVAnalysisCopyPasteResponse,
} from "@/app/api/cv-analyses/[id]/score/copy-paste/preview/responses";
import {
  applyCVAnalysisCopyPaste,
  prepareCVAnalysisCopyPaste,
  previewCVAnalysisCopyPaste,
} from "../api/cv-analysis-copy-paste-api";

const CV_CORRECTION_INSTRUCTIONS =
  "Please return only the required JSON envelope. Do not include Markdown or explanation outside JSON. Keep workflowId as cv_analysis.score and schemaVersion as 1.";

interface CVScoreCopyPasteModalProps {
  analysisId: string;
  additionalContext: string | null;
  open: boolean;
  onClose: () => void;
  onApplied: (analysis: CVAnalysisDetailResponse) => void;
}

export default function CVScoreCopyPasteModal({
  analysisId,
  additionalContext,
  open,
  onClose,
  onApplied,
}: CVScoreCopyPasteModalProps) {
  const t = useTranslations("analysisFlow.copyPaste");

  const state = useCopyPasteWorkflowState({
    open,
    prepare: () =>
      prepareCVAnalysisCopyPaste(analysisId, { additionalContext }),
    preview: (rawResponse) =>
      previewCVAnalysisCopyPaste(analysisId, { rawResponse }),
    apply: (previewData) =>
      applyCVAnalysisCopyPaste(analysisId, {
        parsedResult: previewData.parsedResult as CVAnalysisCopyPasteResult,
      }),
    getCorrectionInstructions: () => CV_CORRECTION_INSTRUCTIONS,
    onApplied: (result) => onApplied(result as CVAnalysisDetailResponse),
    onClose,
  });

  return (
    <CopyPasteWorkflowModal<PreviewCVAnalysisCopyPasteResponse>
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
      renderPreview={(data) => <CVScoreCopyPastePreview data={data} />}
      getApplyLabel={(data) =>
        data.preview.willReplaceExistingResult
          ? t("replaceAnalysis")
          : t("applyAnalysis")
      }
      isApplying={state.isApplying}
      onApply={state.applyResult}
      error={state.error}

      copiedCorrection={state.copiedCorrection}
      onCopyCorrection={state.copyCorrection}
    />
  );
}

function CVScoreCopyPastePreview({
  data,
}: {
  data: PreviewCVAnalysisCopyPasteResponse;
}) {
  const t = useTranslations("analysisFlow.copyPaste");
  return (
    <div className="space-y-4">
      {data.preview.willReplaceExistingResult && (
        <AlertBanner tone={ALERT_BANNER_TONES.WARNING}>
          {t("replacementWarning")}
        </AlertBanner>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <CopyPastePreviewItem
          label={t("scoreLabel")}
          value={`${data.preview.score}/100`}
        />
        <CopyPastePreviewItem
          label={t("originLabel")}
          value={t("externalChat")}
        />
        <CopyPastePreviewItem
          label={t("strengthsCount")}
          value={data.preview.strengthsCount}
        />
        <CopyPastePreviewItem
          label={t("improvementAreasCount")}
          value={data.preview.improvementAreasCount}
        />
        <CopyPastePreviewItem
          label={t("recommendationsCount")}
          value={data.preview.recommendationsCount}
        />
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-2 text-xs font-medium uppercase text-zinc-500">
          {t("summaryLabel")}
        </p>
        <p className="text-sm text-zinc-200">{data.preview.summary}</p>
      </div>
    </div>
  );
}
