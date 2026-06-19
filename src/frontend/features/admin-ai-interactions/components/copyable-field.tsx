"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-card p-3 shadow-[var(--ui-panel-shadow-soft)]">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{label}</span>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-xs font-semibold text-text-main" title={value}>{value}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-accent hover:text-text-main"
        >
          {copied ? <Check className="h-3 w-3 text-success-text" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}
