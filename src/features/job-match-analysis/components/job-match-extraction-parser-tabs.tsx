"use client";

import { useTranslations } from "next-intl";

type ParserTab = "python" | "pdfjs" | "node";

interface ParserConfig {
  key: ParserTab;
  labelKey: string;
  color: string;
  badgeKey: string;
  badgeColor: string;
}

interface JobMatchExtractionParserTabsProps {
  parsers: ParserConfig[];
  activeTab: ParserTab;
  onTabChange: (tab: ParserTab) => void;
  getTextForTab: (tab: ParserTab) => string | null;
  getErrorForTab: (tab: ParserTab) => string | null;
}

export default function JobMatchExtractionParserTabs({
  parsers,
  activeTab,
  onTabChange,
  getTextForTab,
  getErrorForTab,
}: JobMatchExtractionParserTabsProps) {
  const t = useTranslations("analysisFlow.extraction");

  return (
    <div className="shrink-0 flex flex-col md:flex-row gap-3">
      {parsers.map((parser) => {
        const text = getTextForTab(parser.key);
        const error = getErrorForTab(parser.key);
        const hasContent = !!text;
        const hasError = !!error;

        return (
          <button
            key={parser.key}
            onClick={() => onTabChange(parser.key)}
            className={`
              flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left flex-1 border
              ${
                activeTab === parser.key
                  ? "bg-white/[0.07] border-white/[0.12] shadow-xl ring-1 ring-white/[0.05]"
                  : "bg-white/[0.015] border-transparent hover:bg-white/[0.035] hover:border-white/[0.05]"
              }
            `}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${parser.color} ${
                !hasContent && !hasError ? "opacity-30" : "animate-pulse"
              }`}
            />
            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <p
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    activeTab === parser.key ? "text-zinc-50" : "text-zinc-400"
                  }`}
                >
                  {t(parser.labelKey)}
                </p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${parser.badgeColor}`}>
                  {t(parser.badgeKey)}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate">
                {hasError
                  ? t("error")
                  : hasContent
                    ? `${(text?.length || 0).toLocaleString()} chars`
                    : t("noResult")}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
