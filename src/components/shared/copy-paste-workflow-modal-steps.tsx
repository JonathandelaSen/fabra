"use client";

import { Check, Clipboard, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ExternalAIQuickActions } from "./external-ai-quick-actions";

export function CopyPasteWorkflowCopyStep({
  prompt,
  isPreparing,
  copiedPrompt,
  onCopyPrompt,
  onContinue,
}: {
  prompt: string;
  isPreparing: boolean;
  copiedPrompt: boolean;
  onCopyPrompt: () => Promise<void> | void;
  onContinue: () => void;
}) {
  const t = useTranslations("analysisFlow.copyPaste");
  return (
    <div className="space-y-4">
      <textarea readOnly value={isPreparing ? t("preparing") : prompt} className="h-80 w-full resize-none rounded-lg border border-line bg-field-code p-4 text-sm text-text-soft focus:outline-none" />
      <ExternalAIQuickActions
        prompt={prompt}
        disabled={isPreparing}
        onCopyPrompt={onCopyPrompt}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCopyPrompt} disabled={!prompt || isPreparing} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50">
          {copiedPrompt ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          {copiedPrompt ? t("promptCopied") : t("copyPrompt")}
        </button>
        <button type="button" onClick={onContinue} disabled={!prompt || isPreparing} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-text-main hover:bg-panel-hover disabled:opacity-50">
          {t("continue")}
        </button>
      </div>
    </div>
  );
}

export function CopyPasteWorkflowPasteStep({
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
      <label htmlFor="copy-paste-response" className="block text-sm font-medium text-text-soft">
        {t("pasteResponseLabel")}
      </label>
      <textarea id="copy-paste-response" value={rawResponse} onChange={(event) => onRawResponseChange(event.target.value)} className="h-72 w-full resize-none rounded-lg border border-line bg-field-code p-4 text-sm text-text-soft focus:border-ring/50 focus:outline-none" />
      <div className="flex justify-end">
        <button type="button" onClick={onValidateResponse} disabled={isPreviewing || !rawResponse.trim()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50">
          {isPreviewing && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("validateResponse")}
        </button>
      </div>
    </div>
  );
}
