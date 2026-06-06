"use client";

import { useTranslations } from "next-intl";
import { FileText, Download, Eye } from "lucide-react";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import type { StoredAIProvider } from "@/lib/browser-preferences";

interface ExtractionHeaderProps {
  filename: string;
  analysisId: string;
  actionLabel: string;
  showReAnalysis: boolean;
  aiScore: number | null;
  showPdfPreview: boolean;
  onTogglePdfPreview: () => void;
  pdfUrl: string;
  wordCount: number;
  charCount: number;
  reAnalysis: {
    loading: boolean;
    hasAIApiKey: boolean;
    selectedProvider: StoredAIProvider;
    onProviderChange: (provider: StoredAIProvider) => void;
    selectedModel: string;
    onModelChange: (model: string) => void;
    onRun: () => void;
    onConfigure: () => void;
    onOpenCopyPaste: () => void;
  };
}

export default function ExtractionHeader({
  filename,
  analysisId,
  actionLabel,
  showReAnalysis,
  aiScore,
  showPdfPreview,
  onTogglePdfPreview,
  pdfUrl,
  wordCount,
  charCount,
  reAnalysis,
}: ExtractionHeaderProps) {
  const t = useTranslations("analysisFlow.extraction");

  return (
    <div className="shrink-0 py-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
          <FileText className="w-4.5 h-4.5 text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-text-main truncate">
            {filename}
          </h2>
          <p className="text-[10px] sm:text-xs text-text-muted truncate">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {analysisId && (
          <>
            {showReAnalysis && aiScore !== null && (
              <AIActionLauncher
                actionLabel={actionLabel}
                loading={reAnalysis.loading}
                integrated={{
                  available: reAnalysis.hasAIApiKey,
                  selectedProvider: reAnalysis.selectedProvider,
                  onProviderChange: reAnalysis.onProviderChange,
                  selectedModelId: reAnalysis.selectedModel,
                  onModelChange: reAnalysis.onModelChange,
                  onRun: reAnalysis.onRun,
                  onConfigure: reAnalysis.onConfigure,
                }}
                copyPaste={{
                  available: true,
                  onOpenFlow: reAnalysis.onOpenCopyPaste,
                }}
              />
            )}
            <button
              onClick={onTogglePdfPreview}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showPdfPreview
                  ? "bg-indigo-500 text-white"
                  : "text-text-muted bg-panel-control hover:bg-panel-active hover:text-text-main"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">
                {showPdfPreview ? t("closePdf") : t("viewPdf")}
              </span>
              <span className="xs:hidden">
                {showPdfPreview ? t("close") : "PDF"}
              </span>
            </button>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
              title={t("viewPdf")}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t("download")}</span>
            </a>
          </>
        )}
        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          <span className="text-[10px] sm:text-xs text-text-muted bg-panel-control px-2 py-1 rounded-md whitespace-nowrap">
            {wordCount.toLocaleString()}{" "}
            <span className="hidden xs:inline">{t("words")}</span>
            <span className="xs:hidden">w</span>
          </span>
          <span className="text-[10px] sm:text-xs text-text-muted bg-panel-control px-2 py-1 rounded-md whitespace-nowrap">
            {charCount.toLocaleString()}{" "}
            <span className="hidden xs:inline">{t("characters")}</span>
            <span className="xs:hidden">ch</span>
          </span>
        </div>
      </div>
    </div>
  );
}
