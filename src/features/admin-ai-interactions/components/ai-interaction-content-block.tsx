"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";

function formatContent(content: string | null): string {
  if (!content) return "";
  try {
    const trimmed = content.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    }
    return content;
  } catch {
    return content;
  }
}

export function AIInteractionContentBlock({
  title,
  content,
  emptyLabel,
}: {
  title: string;
  content: string | null;
  emptyLabel: string;
}) {
  const t = useTranslations("admin.aiInteractions");
  const [copied, setCopied] = useState(false);

  const formatted = formatContent(content);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-main">{title}</h3>
        {content && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              title={t("copyContent")}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success-text" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
      <pre
        className="w-full h-auto max-h-none overflow-x-auto overflow-y-visible whitespace-pre-wrap rounded-xl bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-300 border border-zinc-900"
      >
        {formatted || emptyLabel}
      </pre>
    </section>
  );
}
