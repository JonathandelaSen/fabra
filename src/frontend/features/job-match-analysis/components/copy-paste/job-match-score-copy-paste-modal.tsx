"use client";

import { useLocale, useTranslations } from "next-intl";
import CopyPasteWorkflowModal, {
  CopyPastePreviewItem,
} from "@/frontend/components/shared/copy-paste-workflow-modal";
import { useCopyPasteWorkflowState } from "@/frontend/components/shared/use-copy-paste-workflow-state";
import { AlertBanner, ALERT_BANNER_TONES } from "@/frontend/components/shared/alert-banner";
import type { JobMatchAnalysisDetailResponse } from "@/app/api/job-match-analyses/responses";
import type { PreviewJobMatchAnalysisCopyPasteResponse } from "@/app/api/job-match-analyses/[id]/score/copy-paste/preview/responses";
import { useJobMatchAnalysisCopyPaste } from "../../hooks/use-job-match-analysis-copy-paste";

const JOB_MATCH_CORRECTION_INSTRUCTIONS =
  "Please return only the required JSON envelope. Do not include Markdown or explanation outside JSON. Keep workflowId as job_match_analysis.score and schemaVersion as 1.";

interface JobMatchScoreCopyPasteModalProps {
  analysisId: string;
  jobDescription: string;
  jobUrl: string | null;
  open: boolean;
  onClose: () => void;
  onApplied: (analysis: JobMatchAnalysisDetailResponse) => void;
}

export default function JobMatchScoreCopyPasteModal({
  analysisId,
  jobDescription,
  jobUrl,
  open,
  onClose,
  onApplied,
}: JobMatchScoreCopyPasteModalProps) {
  const t = useTranslations("analysisFlow.copyPaste");
  const locale = useLocale();
  const {
    prepareJobMatchAnalysisCopyPaste,
    previewJobMatchAnalysisCopyPaste,
    applyJobMatchAnalysisCopyPaste,
  } = useJobMatchAnalysisCopyPaste();

  const state = useCopyPasteWorkflowState({
    open,
    prepare: () =>
      prepareJobMatchAnalysisCopyPaste(analysisId, {
        jobDescription,
        jobUrl,
        language: locale,
      }),
    preview: (rawResponse) =>
      previewJobMatchAnalysisCopyPaste(analysisId, { rawResponse }),
    apply: (previewData) =>
      applyJobMatchAnalysisCopyPaste(analysisId, {
        parsedResult: previewData.parsedResult,
        jobDescription,
        jobUrl,
      }),
    getCorrectionInstructions: () => JOB_MATCH_CORRECTION_INSTRUCTIONS,
    onApplied: (result) => onApplied(result as JobMatchAnalysisDetailResponse),
    onClose,
  });

  return (
    <CopyPasteWorkflowModal<PreviewJobMatchAnalysisCopyPasteResponse>
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
      renderPreview={(data) => (
        <JobMatchScoreCopyPastePreview data={data} />
      )}
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

function JobMatchScoreCopyPastePreview({
  data,
}: {
  data: PreviewJobMatchAnalysisCopyPasteResponse;
}) {
  const t = useTranslations("analysisFlow.copyPaste");
  const tJob = useTranslations("jobMatchCopyPaste");

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
          label={tJob("matchingKeywords")}
          value={data.preview.matchingKeywordsCount}
        />
        <CopyPastePreviewItem
          label={tJob("missingKeywords")}
          value={data.preview.missingKeywordsCount}
        />
        <CopyPastePreviewItem
          label={tJob("jobKeywords")}
          value={data.preview.jobKeywordsCount}
        />
        <CopyPastePreviewItem
          label={t("recommendationsCount")}
          value={data.preview.recommendationsCount}
        />
      </div>
      <div className="rounded-lg border border-line bg-panel/[0.03] p-4">
        <p className="mb-2 text-xs font-medium uppercase text-text-muted">
          {t("summaryLabel")}
        </p>
        <p className="text-sm text-text-soft">{data.preview.summary}</p>
      </div>
    </div>
  );
}
