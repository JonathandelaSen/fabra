"use client";

import { useState } from "react";
import { CopyPastePromptStep } from "./copy-paste-prompt-step";

interface CopyPasteTextPanelProps {
  title: string;
  privacyNotice: string;
  prompt: string;
  copyLabel: string;
  copiedLabel: string;
  pastedTextLabel: string;
  pastedTextPlaceholder: string;
  applyLabel: string;
  emptyResponseError: string;
  onApplyText: (text: string) => void;
}

export function CopyPasteTextPanel({
  title,
  privacyNotice,
  prompt,
  copyLabel,
  copiedLabel,
  pastedTextLabel,
  pastedTextPlaceholder,
  applyLabel,
  emptyResponseError,
  onApplyText,
}: CopyPasteTextPanelProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const copyPrompt = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    window.setTimeout(() => setCopiedPrompt(false), 1800);
  };

  const applyText = () => {
    const text = pastedText.trim();
    if (!text) {
      setError(emptyResponseError);
      return;
    }
    setError(null);
    onApplyText(text);
  };

  return (
    <section className="space-y-4 rounded-lg border border-line-default bg-panel-subtle p-4">
      <div>
        <h3 className="text-sm font-semibold text-text-main">{title}</h3>
        <p className="mt-2 rounded-lg border border-warning-border bg-warning-soft px-3 py-2 text-xs leading-relaxed text-warning-text">
          {privacyNotice}
        </p>
      </div>

      <CopyPastePromptStep
        prompt={prompt}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
        onCopyPrompt={copyPrompt}
        copiedPrompt={copiedPrompt}
      />

      <div className="space-y-2">
        <label
          htmlFor="work-journal-copy-paste-response"
          className="block text-xs font-medium text-text-muted"
        >
          {pastedTextLabel}
        </label>
        <textarea
          id="work-journal-copy-paste-response"
          value={pastedText}
          onChange={(event) => setPastedText(event.target.value)}
          placeholder={pastedTextPlaceholder}
          className="min-h-32 w-full resize-y rounded-lg border border-line-default bg-field p-3 text-sm leading-relaxed text-text-soft outline-none placeholder:text-text-faint focus:border-text-soft"
        />
        {error && <p className="text-xs text-danger-text">{error}</p>}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={applyText}
          className="rounded-lg bg-teal-400 px-3 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-teal-300"
        >
          {applyLabel}
        </button>
      </div>
    </section>
  );
}
