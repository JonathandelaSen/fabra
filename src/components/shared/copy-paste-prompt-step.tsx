"use client";

import { Check, Clipboard } from "lucide-react";
import { ExternalAIQuickActions } from "./external-ai-quick-actions";

interface CopyPastePromptStepProps {
  prompt: string;
  copyLabel: string;
  copiedLabel: string;
  onCopyPrompt: () => Promise<void> | void;
  copiedPrompt: boolean;
  isPreparing?: boolean;
}

export function CopyPastePromptStep({
  prompt,
  copyLabel,
  copiedLabel,
  onCopyPrompt,
  copiedPrompt,
  isPreparing = false,
}: CopyPastePromptStepProps) {
  const disabled = !prompt || isPreparing;

  return (
    <div className="space-y-3">
      <textarea
        readOnly
        value={prompt}
        className="h-44 w-full resize-none rounded-lg border border-line-default bg-field-strong p-3 text-xs leading-relaxed text-text-soft outline-none"
      />
      <button
        type="button"
        onClick={onCopyPrompt}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg bg-text-main px-3 py-2 text-xs font-semibold text-text-on-dark transition-colors hover:bg-panel disabled:opacity-50"
      >
        {copiedPrompt ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Clipboard className="h-3.5 w-3.5" />
        )}
        {copiedPrompt ? copiedLabel : copyLabel}
      </button>
      <ExternalAIQuickActions
        prompt={prompt}
        disabled={isPreparing}
        onCopyPrompt={onCopyPrompt}
      />
    </div>
  );
}
