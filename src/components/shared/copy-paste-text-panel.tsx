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
    <section className="space-y-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100">
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
          className="block text-xs font-medium text-zinc-400"
        >
          {pastedTextLabel}
        </label>
        <textarea
          id="work-journal-copy-paste-response"
          value={pastedText}
          onChange={(event) => setPastedText(event.target.value)}
          placeholder={pastedTextPlaceholder}
          className="min-h-32 w-full resize-y rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-300"
        />
        {error && <p className="text-xs text-rose-300">{error}</p>}
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
