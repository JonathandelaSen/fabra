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
      ? "text-sky-400"
      : match[2]
        ? "text-emerald-400"
        : match[3]
          ? "text-amber-400"
          : match[4]
            ? "text-violet-400"
            : "text-rose-400";

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
  const [mode, setMode] = useState<"interactive" | "raw">("raw");

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
    return <div className="text-sm font-mono text-zinc-500">{t("noData")}</div>;
  }

  const isJsonContainer = typeof data === "object" && data !== null;
  const rootKeys = isJsonContainer ? Object.keys(data) : [];
  const rootType = Array.isArray(data) ? `ARRAY(${data.length})` : typeof data === "object" ? `OBJECT(${rootKeys.length})` : typeof data;
  const rawDisplayContent = isJsonContainer
    ? JSON.stringify(data, null, 2)
    : rawContent ?? String(data);

  return (
    <div className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 shadow-inner">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-zinc-900 bg-zinc-900/40 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{title || t("parsedJsonTrace")}</span>
          <span className="text-[10px] text-zinc-600">({rootType})</span>
        </div>

        <div className="flex items-center gap-1.5 p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("interactive")}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
              mode === "interactive"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t("viewInteractive")}
          </button>
          <button
            type="button"
            onClick={() => setMode("raw")}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
              mode === "raw"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t("viewRaw")}
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 rounded-lg transition-all"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
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
        <pre className="min-w-0 whitespace-pre-wrap break-words border-t border-zinc-900/40 bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-300 select-text">
          <StaticHighlightedJson content={rawDisplayContent} />
        </pre>
      ) : (
        <div className="min-w-0 overflow-x-auto p-4 font-mono text-sm select-text [&_.no-icon]:ml-4 [&_.pointer]:cursor-pointer [&_.pointer]:rounded [&_.pointer]:px-1 [&_.pointer:hover]:bg-zinc-800/60">
          {isJsonContainer ? (
            <JsonView
              data={data}
              shouldExpandNode={collapseAllNested}
              style={darkStyles}
            />
          ) : (
            <span className="text-zinc-300">{JSON.stringify(data)}</span>
          )}
        </div>
      )}
    </div>
  );
}
