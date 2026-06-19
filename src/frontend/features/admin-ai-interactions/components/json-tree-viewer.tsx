"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { collapseAllNested, darkStyles, JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

const JSON_TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false)\b|\bnull\b/g;

function StaticHighlightedJson({ content }: { content: string }) {
  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(JSON_TOKEN_PATTERN)) {
    const index = match.index;
    if (index > lastIndex) tokens.push(content.slice(lastIndex, index));

    const className = match[1]
      ? "text-info-text"
      : match[2]
        ? "text-success-text"
        : match[3]
          ? "text-warning-text"
          : match[4]
            ? "text-action-text"
            : "text-danger-text";

    tokens.push(
      <span key={index} className={className}>
        {match[0]}
      </span>,
    );
    lastIndex = index + match[0].length;
  }

  if (lastIndex < content.length) tokens.push(content.slice(lastIndex));
  return tokens;
}

export type JSONViewerMode = "interactive" | "raw";

export function JSONTreeViewer({
  data,
  title,
  rawContent,
}: {
  data: unknown;
  title?: string;
  rawContent?: string;
}) {
  const t = useTranslations("admin.aiInteractions");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<JSONViewerMode>("raw");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawContent ?? JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (data === null || data === undefined) {
    return <div className="text-sm font-mono text-text-muted">{t("noData")}</div>;
  }

  const isJsonContainer = typeof data === "object" && data !== null;
  const rootKeys = isJsonContainer ? Object.keys(data) : [];
  const rootType = Array.isArray(data) ? `ARRAY(${data.length})` : typeof data === "object" ? `OBJECT(${rootKeys.length})` : typeof data;
  const rawDisplayContent = isJsonContainer
    ? JSON.stringify(data, null, 2)
    : rawContent ?? String(data);

  return (
    <div className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-line bg-field-code shadow-inner">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-line bg-panel-elevated/40 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-mono text-text-muted">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>{title || t("parsedJsonTrace")}</span>
          <span className="text-[10px] text-text-faint">({rootType})</span>
        </div>

        <div className="flex items-center gap-1.5 p-0.5 bg-panel-elevated border border-line-default rounded-lg">
          <button
            type="button"
            onClick={() => setMode("interactive")}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
              mode === "interactive"
                ? "bg-panel-control text-text-on-bright"
                : "text-text-muted hover:text-text-soft"
            }`}
          >
            {t("viewInteractive")}
          </button>
          <button
            type="button"
            onClick={() => setMode("raw")}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
              mode === "raw"
                ? "bg-panel-control text-text-on-bright"
                : "text-text-muted hover:text-text-soft"
            }`}
          >
            {t("viewRaw")}
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-text-muted hover:text-text-soft border border-line-default hover:border-line-strong bg-panel-elevated rounded-lg transition-all"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-success-text" />
              <span>{t("copied")}</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>{t("copyJson")}</span>
            </>
          )}
        </button>
      </div>
      
      {mode === "raw" ? (
        <pre className="min-w-0 whitespace-pre-wrap break-words border-t border-line/40 bg-field-code p-4 font-mono text-sm leading-relaxed text-text-soft select-text">
          <StaticHighlightedJson content={rawDisplayContent} />
        </pre>
      ) : (
        <div className="min-w-0 overflow-x-auto p-4 font-mono text-sm select-text [&_.no-icon]:ml-4 [&_.pointer]:cursor-pointer [&_.pointer]:rounded [&_.pointer]:px-1 [&_.pointer:hover]:bg-panel-control/60">
          {isJsonContainer ? (
            <JsonView
              data={data}
              shouldExpandNode={collapseAllNested}
              style={darkStyles}
            />
          ) : (
            <span className="text-text-soft">{JSON.stringify(data)}</span>
          )}
        </div>
      )}
    </div>
  );
}
