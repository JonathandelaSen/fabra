"use client";

import { useTranslations } from "next-intl";
import CopyPasteWorkflowModal, {
  CopyPastePreviewItem,
} from "@/components/shared/copy-paste-workflow-modal";
import { useCopyPasteWorkflowState } from "@/components/shared/use-copy-paste-workflow-state";
import type { PreviewCVEditorCopyPasteResponse } from "@/app/api/cvs/[id]/edit/copy-paste/preview/responses";
import type { ApplyCVEditorCopyPasteResponse } from "@/app/api/cvs/[id]/edit/copy-paste/apply/responses";
import {
  applyCVEditorCopyPaste,
  prepareCVEditorCopyPaste,
  previewCVEditorCopyPaste,
} from "../api/cv-editor-copy-paste-api";

const CORRECTION_INSTRUCTIONS =
  "Please return only the required JSON envelope. Do not include Markdown or explanation outside JSON. Keep workflowId as cv_editor.apply_instruction and schemaVersion as 1.";

interface CVEditorCopyPasteModalProps {
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

  const state = useCopyPasteWorkflowState({
    open,
    prepare: () => prepareCVEditorCopyPaste(cvId, { instruction }),
    preview: (rawResponse) =>
      previewCVEditorCopyPaste(cvId, { rawResponse }),
    apply: (previewData) =>
      applyCVEditorCopyPaste(cvId, {
        parsedResult: previewData.parsedResult,
      }),
    getCorrectionInstructions: () => CORRECTION_INSTRUCTIONS,
    onApplied: (result) =>
      onApplied(result as ApplyCVEditorCopyPasteResponse),
    onClose,
  });

  return (
    <CopyPasteWorkflowModal<
      { prompt: string; privacyNotice: string },
      PreviewCVEditorCopyPasteResponse
    >
      open={open}
      onClose={onClose}
      title={t("title")}
      intro={t("intro")}
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
      renderPreview={(data) => <CVEditorCopyPastePreview data={data} />}
      getApplyLabel={() => t("applyEdit")}
      isApplying={state.isApplying}
      onApply={state.applyResult}
      error={state.error}
      correctionInstructions={CORRECTION_INSTRUCTIONS}
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
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {data.warnings[0]}
        </div>
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
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-2 text-xs font-medium uppercase text-zinc-500">
            {t("changedSectionsLabel")}
          </p>
          <div className="flex flex-wrap gap-2">
            {data.preview.changedSections.map((section) => (
              <span
                key={section}
                className="rounded-md bg-teal-500/10 px-2 py-0.5 text-xs text-teal-300"
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
