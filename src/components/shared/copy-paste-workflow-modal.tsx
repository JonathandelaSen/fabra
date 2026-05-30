"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import CopyPasteWorkflowSteps from "./copy-paste-workflow-steps";
import { AlertBanner, ALERT_BANNER_TONES } from "./alert-banner";
import {
  CopyPasteWorkflowError,
  CopyPasteWorkflowModalHeader,
} from "./copy-paste-workflow-modal-parts";
import {
  CopyPasteWorkflowCopyStep,
  CopyPasteWorkflowPasteStep,
} from "./copy-paste-workflow-modal-steps";

type Step = "copy" | "paste" | "review";

export interface CopyPasteWorkflowModalProps<TPreview> {
  open: boolean;
  onClose: () => void;
  title: string;
  intro: string;

  step: Step;
  onStepChange: (step: Step) => void;

  isPreparing: boolean;
  prompt: string;
  privacyNotice: string;
  copiedPrompt: boolean;
  onCopyPrompt: () => void;

  rawResponse: string;
  onRawResponseChange: (value: string) => void;
  isPreviewing: boolean;
  onValidateResponse: () => void;

  previewData: TPreview | null;
  renderPreview: (data: TPreview) => ReactNode;
  getApplyLabel: (data: TPreview) => string;
  isApplying: boolean;
  onApply: () => void;

  error: string | null;
  copiedCorrection: boolean;
  onCopyCorrection: () => void;
}

export default function CopyPasteWorkflowModal<TPreview>({
  open,
  onClose,
  title,
  intro,
  step,
  onStepChange,
  isPreparing,
  prompt,
  privacyNotice,
  copiedPrompt,
  onCopyPrompt,
  rawResponse,
  onRawResponseChange,
  isPreviewing,
  onValidateResponse,
  previewData,
  renderPreview,
  getApplyLabel,
  isApplying,
  onApply,
  error,
  copiedCorrection,
  onCopyCorrection,
}: CopyPasteWorkflowModalProps<TPreview>) {
  const t = useTranslations("analysisFlow.copyPaste");

  if (!open) return null;

  const loading = isPreparing || isPreviewing || isApplying;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <CopyPasteWorkflowModalHeader
          title={title}
          intro={intro}
          onClose={onClose}
        />

        <CopyPasteWorkflowSteps step={step} />

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {privacyNotice && (
            <AlertBanner tone={ALERT_BANNER_TONES.WARNING} className="mb-4">
              {t("privacyNotice")}
            </AlertBanner>
          )}

          {error && (
            <CopyPasteWorkflowError
              error={error}
              step={step}
              copiedCorrection={copiedCorrection}
              onCopyCorrection={onCopyCorrection}
            />
          )}

          {step === "copy" && (
            <CopyPasteWorkflowCopyStep
              prompt={prompt}
              isPreparing={isPreparing}
              copiedPrompt={copiedPrompt}
              onCopyPrompt={onCopyPrompt}
              onContinue={() => onStepChange("paste")}
            />
          )}

          {step === "paste" && (
            <CopyPasteWorkflowPasteStep
              rawResponse={rawResponse}
              onRawResponseChange={onRawResponseChange}
              isPreviewing={isPreviewing}
              onValidateResponse={onValidateResponse}
            />
          )}

          {step === "review" && previewData && renderPreview(previewData)}
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          >
            {t("cancel")}
          </button>
          {step === "review" && previewData && (
            <button
              type="button"
              onClick={onApply}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {isApplying && <Loader2 className="h-4 w-4 animate-spin" />}
              {getApplyLabel(previewData)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CopyPastePreviewItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}
