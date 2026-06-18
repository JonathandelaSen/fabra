"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  FileText,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type ExtractionTab = "python" | "pdfjs" | "node";

interface ExtractionTextPanelProps {
  activeTab: ExtractionTab;
  currentText: string | null;
  currentError: string | null;
  copied: boolean;
  fullscreen: boolean;
  parserColor?: string;
  parserDescriptionKey: string;
  onCopy: () => void;
  onToggleFullscreen: () => void;
}

export function ExtractionTextPanel({
  activeTab,
  currentText,
  currentError,
  copied,
  fullscreen,
  parserColor = "bg-success",
  parserDescriptionKey,
  onCopy,
  onToggleFullscreen,
}: ExtractionTextPanelProps) {
  const t = useTranslations("analysisFlow.extraction");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.15 }}
      className={`
        flex flex-col rounded-2xl border border-line bg-panel-base overflow-hidden lg:min-h-0
        ${isCollapsed ? "flex-initial" : "flex-1 min-h-[300px]"}
        ${fullscreen ? "fixed inset-4 z-50" : "relative"}
      `}
    >
      {!isCollapsed && (
        <motion.div
          key={activeTab + "-scan"}
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-action to-transparent shadow-[var(--ui-action-line-shadow)] z-10 pointer-events-none"
        />
      )}

      <div className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 border-b border-line bg-panel-subtle">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${parserColor}`} />
          <span className="text-[10px] sm:text-xs text-text-muted font-medium truncate">
            {t(`parserDescriptions.${parserDescriptionKey}`)}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onCopy}
            disabled={!currentText}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-text-muted hover:text-text-main hover:bg-panel-hover transition-all disabled:opacity-30"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success-text" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden xs:inline">
              {copied ? t("copied") : t("copy")}
            </span>
          </button>
          {!fullscreen && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-text-muted hover:text-text-main hover:bg-panel-hover transition-all"
              title={isCollapsed ? t("expand") : t("collapse")}
            >
              {isCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
              <span className="hidden xs:inline">
                {isCollapsed ? t("expand") : t("collapse")}
              </span>
            </button>
          )}
          <button
            onClick={onToggleFullscreen}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-text-muted hover:text-text-main hover:bg-panel-hover transition-all"
          >
            {fullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-auto p-4 sm:p-5">
        {currentError && !currentText ? (
          <div className="flex items-start gap-3 text-danger-text">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{t("extractionError")}</p>
              <p className="text-xs text-danger-text/70 mt-1 font-mono break-all text-left">
                {currentError}
              </p>
            </div>
          </div>
        ) : currentText ? (
          <pre className="text-sm sm:text-[0.9375rem] text-text-soft font-mono whitespace-pre-wrap leading-relaxed text-left">
            {currentText}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-10 text-text-faint">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 mb-3 opacity-30" />
            <p className="text-xs sm:text-sm text-center px-4">{t("noText")}</p>
          </div>
        )}
      </div>
      )}
    </motion.div>
  );
}
