"use client";

import { ReactNode } from "react";
import { Check, Clipboard, Copy, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import CopyPasteWorkflowSteps from "./copy-paste-workflow-steps";

type Step = "copy" | "paste" | "review";

export interface CopyPasteWorkflowModalProps<TPrepare, TPreview> {
  open: boolean;
  onClose: () => void;
  title: string;
  intro: string;

  step: Step;
  onStepChange: (step: Step) => void;

  prepareData: TPrepare | null;
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
  correctionInstructions: string;
  copiedCorrection: boolean;
  onCopyCorrection: () => void;
}

export default function CopyPasteWorkflowModal<TPrepare, TPreview>({
  open,
  onClose,
  title,
  intro,
  step,
  onStepChange,
  prepareData,
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
  correctionInstructions,
  copiedCorrection,
  onCopyCorrection,
}: CopyPasteWorkflowModalProps<TPrepare, TPreview>) {
  const t = useTranslations("analysisFlow.copyPaste");

  if (!open) return null;

  const loading = isPreparing || isPreviewing || isApplying;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
        <CopyPasteWorkflowModalHeader
          title={title}
          intro={intro}
          onClose={onClose}
        />

        <CopyPasteWorkflowSteps step={step} />

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {privacyNotice && (
            <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {t("privacyNotice")}
            </div>
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

function CopyPasteWorkflowModalHeader({
  title,
  intro,
  onClose,
}: {
  title: string;
  intro: string;
  onClose: () => void;
}) {
  const t = useTranslations("analysisFlow.copyPaste");
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{intro}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-zinc-200"
        aria-label={t("close")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function CopyPasteWorkflowError({
  error,
  step,
  copiedCorrection,
  onCopyCorrection,
}: {
  error: string;
  step: Step;
  copiedCorrection: boolean;
  onCopyCorrection: () => void;
}) {
  const t = useTranslations("analysisFlow.copyPaste");
  return (
    <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      <p>{error}</p>
      {step === "paste" && (
        <button
          type="button"
          onClick={onCopyCorrection}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-400 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-rose-300"
        >
          <Copy className="h-3.5 w-3.5" />
          {copiedCorrection ? t("correctionCopied") : t("copyCorrection")}
        </button>
      )}
    </div>
  );
}

function CopyPasteWorkflowCopyStep({
  prompt,
  isPreparing,
  copiedPrompt,
  onCopyPrompt,
  onContinue,
}: {
  prompt: string;
  isPreparing: boolean;
  copiedPrompt: boolean;
  onCopyPrompt: () => void;
  onContinue: () => void;
}) {
  const t = useTranslations("analysisFlow.copyPaste");
  return (
    <div className="space-y-4">
      <textarea
        readOnly
        value={isPreparing ? t("preparing") : prompt}
        className="h-80 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-zinc-300 focus:outline-none"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCopyPrompt}
          disabled={!prompt || isPreparing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {copiedPrompt ? (
            <Check className="h-4 w-4" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
          {copiedPrompt ? t("promptCopied") : t("copyPrompt")}
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!prompt || isPreparing}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-50"
        >
          {t("continue")}
        </button>
      </div>
    </div>
  );
}

function CopyPasteWorkflowPasteStep({
  rawResponse,
  onRawResponseChange,
  isPreviewing,
  onValidateResponse,
}: {
  rawResponse: string;
  onRawResponseChange: (value: string) => void;
  isPreviewing: boolean;
  onValidateResponse: () => void;
}) {
  const t = useTranslations("analysisFlow.copyPaste");
  return (
    <div className="space-y-4">
      <label
        htmlFor="copy-paste-response"
        className="block text-sm font-medium text-zinc-300"
      >
        {t("pasteResponseLabel")}
      </label>
      <textarea
        id="copy-paste-response"
        value={rawResponse}
        onChange={(event) => onRawResponseChange(event.target.value)}
        className="h-72 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-zinc-300 focus:border-indigo-500/50 focus:outline-none"
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onValidateResponse}
          disabled={isPreviewing || !rawResponse.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {isPreviewing && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("validateResponse")}
        </button>
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
