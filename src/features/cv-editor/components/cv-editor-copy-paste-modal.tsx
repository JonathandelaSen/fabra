"use client";

import { useTranslations } from "next-intl";
import CopyPasteWorkflowModal, {
  CopyPastePreviewItem,
} from "@/components/shared/copy-paste-workflow-modal";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import type { ApplyCVEditorCopyPasteResponse, PreviewCVEditorCopyPasteResponse } from "../types";
import { useCVEditorCopyPasteWorkflow } from "../hooks/use-cv-editor-copy-paste-workflow";

export interface CVEditorCopyPasteModalProps {
  cvId: string;
  instruction: string;
  open: boolean;
  onClose: () => void;
  onApplied: (result: ApplyCVEditorCopyPasteResponse) => void;
}

export default function CVEditorCopyPasteModal({
  cvId,
  instruction,
  open,
  onClose,
  onApplied,
}: CVEditorCopyPasteModalProps) {
  const t = useTranslations("cvEditor.copyPaste");

  const state = useCVEditorCopyPasteWorkflow({
    cvId,
    instruction,
    open,
    onApplied,
    onClose,
  });

  return (
    <CopyPasteWorkflowModal<PreviewCVEditorCopyPasteResponse>
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
      renderPreview={(data) => <CVEditorCopyPastePreview data={data} />}
      getApplyLabel={() => t("applyEdit")}
      isApplying={state.isApplying}
      onApply={state.applyResult}
      error={state.error}

      copiedCorrection={state.copiedCorrection}
      onCopyCorrection={state.copyCorrection}
    />
  );
}

function CVEditorCopyPastePreview({
  data,
}: {
  data: PreviewCVEditorCopyPasteResponse;
}) {
  const t = useTranslations("cvEditor.copyPaste");
  return (
    <div className="space-y-4">
      {data.warnings.length > 0 && (
        <AlertBanner tone={ALERT_BANNER_TONES.WARNING}>
          {data.warnings[0]}
        </AlertBanner>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <CopyPastePreviewItem
          label={t("nameLabel")}
          value={data.preview.basicsName ?? "—"}
        />
        <CopyPastePreviewItem
          label={t("originLabel")}
          value={t("externalChat")}
        />
        <CopyPastePreviewItem
          label={t("sectionsLabel")}
          value={data.preview.sectionsCount}
        />
        <CopyPastePreviewItem
          label={t("changedLabel")}
          value={data.preview.changedSections.length}
        />
      </div>
      {data.preview.changedSections.length > 0 && (
        <div className="rounded-lg border border-line/10 bg-panel/[0.03] p-4">
          <p className="mb-2 text-xs font-medium uppercase text-text-muted">
            {t("changedSectionsLabel")}
          </p>
          <div className="flex flex-wrap gap-2">
            {data.preview.changedSections.map((section) => (
              <span
                key={section}
                className="rounded-md bg-accent-teal/10 px-2 py-0.5 text-xs text-accent-teal-text"
              >
                {section}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
