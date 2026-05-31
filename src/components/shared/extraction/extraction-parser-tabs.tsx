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

interface ExtractionParserTabsProps {
  parsers: ParserConfig[];
  activeTab: ParserTab;
  onTabChange: (tab: ParserTab) => void;
  getTextForTab: (tab: ParserTab) => string | null;
  getErrorForTab: (tab: ParserTab) => string | null;
}

export default function ExtractionParserTabs({
  parsers,
  activeTab,
  onTabChange,
  getTextForTab,
  getErrorForTab,
}: ExtractionParserTabsProps) {
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
                  ? "bg-panel-hover border-line-default shadow-xl ring-1 ring-line"
                  : "bg-panel-subtle/40 border-transparent hover:bg-panel-hover hover:border-line"
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
                    activeTab === parser.key ? "text-text-main" : "text-text-muted"
                  }`}
                >
                  {t(parser.labelKey)}
                </p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${parser.badgeColor}`}>
                  {t(parser.badgeKey)}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-text-muted truncate">
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
