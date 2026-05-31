"use client";

import { Copy, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { AlertBanner, ALERT_BANNER_TONES } from "./alert-banner";

type Step = "copy" | "paste" | "review";

export function CopyPasteWorkflowModalHeader({
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
    <div className="flex items-center justify-between border-b border-line px-5 py-4">
      <div>
        <h2 className="text-lg font-semibold text-text-main">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">{intro}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-2 text-text-muted hover:bg-panel-hover hover:text-text-main"
        aria-label={t("close")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CopyPasteWorkflowError({
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
    <AlertBanner tone={ALERT_BANNER_TONES.DANGER} className="mb-4">
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
    </AlertBanner>
  );
}
