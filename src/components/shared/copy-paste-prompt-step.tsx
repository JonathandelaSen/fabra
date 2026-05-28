"use client";

import { Check, Clipboard } from "lucide-react";

interface CopyPastePromptStepProps {
  prompt: string;
  copyLabel: string;
  copiedLabel: string;
  onCopyPrompt: () => void;
  copiedPrompt: boolean;
}

export function CopyPastePromptStep({
  prompt,
  copyLabel,
  copiedLabel,
  onCopyPrompt,
  copiedPrompt,
}: CopyPastePromptStepProps) {
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
        disabled={!prompt}
        className="inline-flex items-center gap-2 rounded-lg bg-text-main px-3 py-2 text-xs font-semibold text-text-inverse transition-colors hover:bg-white disabled:opacity-50"
      >
        {copiedPrompt ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Clipboard className="h-3.5 w-3.5" />
        )}
        {copiedPrompt ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
