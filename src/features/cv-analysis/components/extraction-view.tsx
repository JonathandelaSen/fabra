"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  FileText,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  AlertCircle,
  Download,
  Eye,
  X,
} from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import type { AnalysisMode, AIContext } from "@/lib/analysis-types";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import HowAtsWorksEducationBanner from "@/components/shared/how-ats-works-education-banner";
import AnalysisModeSelector from "./analysis-mode-selector";
import CVScoreCopyPasteModal from "./cv-score-copy-paste-modal";
import GeneralAnalysisForm from "./general-analysis-form";
import JobMatchForm from "./job-match-form";
import type { ScoreCVAnalysisInput } from "../hooks/use-cv-analysis-mutations";

interface ExtractionData {
  text_python: string | null;
  text_pdfjs: string | null;
  text_node: string | null;
  extract_error_python: string | null;
  extract_error_pdfjs: string | null;
  extract_error_node: string | null;
}

interface ExtractionViewProps {
  analysis: ExtractionData & {
    id: string;
    cv_id?: string | null;
    title?: string;
    filename: string;
    analysis_mode: AnalysisMode;
    ai_score: number | null;
    job_url?: string | null;
    cv?: {
      id?: string;
      name?: string;
      filename?: string;
      type?: string;
    } | null;
  };
  onAIAnalysisComplete: () => void;
  aiProvider: "gemini" | "mock";
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onScoreAnalysis?: (id: string, input: ScoreCVAnalysisInput) => Promise<void>;
}

type ParserTab = "python" | "pdfjs" | "node";

const PARSERS: {
  key: ParserTab;
  labelKey: string;
  descriptionKey: "python" | "pdfjs" | "node";
  color: string;
  badgeKey: string;
  badgeColor: string;
}[] = [
  {
    key: "python",
    labelKey: "parserLabels.python",
    descriptionKey: "python",
    color: "bg-emerald-500",
    badgeKey: "parserBadges.python",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    key: "pdfjs",
    labelKey: "parserLabels.pdfjs",
    descriptionKey: "pdfjs",
    color: "bg-sky-500",
    badgeKey: "parserBadges.pdfjs",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  {
    key: "node",
    labelKey: "parserLabels.node",
    descriptionKey: "node",
    color: "bg-amber-500",
    badgeKey: "parserBadges.node",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
];

export default function ExtractionView({
  analysis,
  onAIAnalysisComplete,
  aiProvider,
  aiApiKey,
  aiModel,
  hasAIApiKey,
  onOpenSettings,
  onScoreAnalysis,
}: ExtractionViewProps) {
  const t = useTranslations("analysisFlow.extraction");
  const formsT = useTranslations("analysisFlow.forms");
  const [activeTab, setActiveTab] = useState<ParserTab>("python");
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Analysis mode state
  const [selectedMode, setSelectedMode] = useState<AnalysisMode | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copyPasteContext, setCopyPasteContext] = useState<string | null>(null);
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(aiModel || "gemini-2.5-flash");

  const models = [
    { id: "gemini-2.5-flash", label: `Gemini 2.5 Flash (${formsT("fast")})` },
    { id: "gemini-3.1-pro-preview", label: `Gemini 3.1 Pro Preview (${formsT("powerful")})` },
  ];

  const getTextForTab = (tab: ParserTab) => {
    switch (tab) {
      case "python":
        return analysis.text_python;
      case "pdfjs":
        return analysis.text_pdfjs;
      case "node":
        return analysis.text_node;
    }
  };

  const getErrorForTab = (tab: ParserTab) => {
    switch (tab) {
      case "python":
        return analysis.extract_error_python;
      case "pdfjs":
        return analysis.extract_error_pdfjs;
      case "node":
        return analysis.extract_error_node;
    }
  };

  const currentText = getTextForTab(activeTab);
  const currentError = getErrorForTab(activeTab);
  const pdfUrl = analysis.cv_id
    ? analysis.cv?.type === "template"
      ? `/api/cvs/${analysis.cv_id}/template-pdf`
      : `/api/cvs/${analysis.cv_id}/pdf`
    : analysis.analysis_mode === "job_match"
      ? `/api/job-match-analyses/${analysis.id}/pdf`
      : `/api/cv-analyses/${analysis.id}/pdf`;

  const wordCount = currentText
    ? currentText.split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = currentText ? currentText.length : 0;

  const handleCopy = async () => {
    if (!currentText) return;
    await navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGeneralAnalysis = async (context: AIContext, model: string) => {
    if (!hasAIApiKey) {
      setAiError(t("missingApiKey"));
      return;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      if (onScoreAnalysis) {
        await onScoreAnalysis(analysis.id, {
          additionalContext: context?.additionalContext ?? null,
          provider: aiProvider,
          apiKey: aiApiKey,
          model,
        });
      } else {
        const res = await fetch(`/api/cv-analyses/${analysis.id}/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            additionalContext: context?.additionalContext ?? null,
            provider: aiProvider,
            apiKey: aiApiKey,
            model,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || t("aiAnalysisFailed"));
        }
      }

      onAIAnalysisComplete();
    } catch (err: unknown) {
      setAiError(getErrorMessage(err));
    } finally {
      setLoadingAI(false);
    }
  };

  const handleExternalChatAnalysis = (context: AIContext) => {
    setCopyPasteContext(context.additionalContext ?? null);
    setCopyPasteOpen(true);
  };

  const handleJobMatchAnalysis = async (
    jobDescription: string,
    jobUrl: string,
    model: string,
  ) => {
    if (!hasAIApiKey) {
      setAiError(t("missingApiKey"));
      return;
    }

    setLoadingAI(true);
    setAiError(null);

    try {
      const res = await fetch(`/api/job-match-analyses/${analysis.id}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          jobUrl,
          provider: aiProvider,
          apiKey: aiApiKey,
          model,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("aiAnalysisFailed"));
      }

      onAIAnalysisComplete();
    } catch (err: unknown) {
      setAiError(getErrorMessage(err));
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <CVScoreCopyPasteModal
        analysisId={analysis.id}
        additionalContext={copyPasteContext}
        open={copyPasteOpen}
        onClose={() => setCopyPasteOpen(false)}
        onApplied={() => {
          setCopyPasteOpen(false);
          onAIAnalysisComplete();
        }}
      />
      {/* Header bar */}
      <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
            <FileText className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-100 truncate">
              {analysis.filename}
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-500 truncate">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {analysis.id && (
            <>
              {analysis.analysis_mode === "general" && analysis.ai_score !== null && (
                <AIActionLauncher
                  actionLabel={formsT("analyzeCV")}
                  loading={loadingAI}
                  integrated={{
                    available: hasAIApiKey,
                    selectedModelId: selectedModel,
                    models,
                    onModelChange: setSelectedModel,
                    onRun: () => handleGeneralAnalysis({}, selectedModel),
                    onConfigure: onOpenSettings,
                  }}
                  copyPaste={{
                    available: true,
                    onOpenFlow: () => {
                      setCopyPasteContext(null);
                      setCopyPasteOpen(true);
                    },
                  }}
                />
              )}
              <button
                onClick={() => setShowPdfPreview(!showPdfPreview)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showPdfPreview
                    ? "bg-indigo-500 text-white"
                    : "text-zinc-400 bg-zinc-800/60 hover:bg-zinc-800 hover:text-zinc-200"
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
            <span className="text-[10px] sm:text-xs text-zinc-500 bg-zinc-800/60 px-2 py-1 rounded-md whitespace-nowrap">
              {wordCount.toLocaleString()}{" "}
              <span className="hidden xs:inline">{t("words")}</span>
              <span className="xs:hidden">w</span>
            </span>
            <span className="text-[10px] sm:text-xs text-zinc-500 bg-zinc-800/60 px-2 py-1 rounded-md whitespace-nowrap">
              {charCount.toLocaleString()}{" "}
              <span className="hidden xs:inline">{t("characters")}</span>
              <span className="xs:hidden">ch</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-auto p-4 sm:p-6 gap-4 sm:gap-6">
        {/* Educational Banner */}
        <HowAtsWorksEducationBanner />

        {/* Parser Tabs */}
        <div className="shrink-0 flex flex-col md:flex-row gap-3">
          {PARSERS.map((parser) => {
            const text = getTextForTab(parser.key);
            const error = getErrorForTab(parser.key);
            const hasContent = !!text;
            const hasError = !!error;

            return (
              <button
                key={parser.key}
                onClick={() => setActiveTab(parser.key)}
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

        {/* Text Content Area & PDF Preview Side-by-Side */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15 }}
              className={`
                flex-1 flex flex-col rounded-2xl border border-white/[0.06] bg-[#0a0a12] overflow-hidden min-h-[300px] lg:min-h-0
                ${fullscreen ? "fixed inset-4 z-50" : "relative"}
              `}
            >
              {/* Laser scan line animation */}
              <motion.div
                key={activeTab + "-scan"}
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent shadow-[0_0_10px_rgba(99,102,241,0.7)] z-10 pointer-events-none"
              />

              {/* Toolbar */}
              <div className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${PARSERS.find((p) => p.key === activeTab)?.color}`}
                  />
                  <span className="text-[10px] sm:text-xs text-zinc-400 font-medium truncate">
                    {t(`parserDescriptions.${PARSERS.find((p) => p.key === activeTab)?.descriptionKey ?? "python"}`)}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleCopy}
                    disabled={!currentText}
                    className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all disabled:opacity-30"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden xs:inline">
                      {copied ? t("copied") : t("copy")}
                    </span>
                  </button>
                  <button
                    onClick={() => setFullscreen(!fullscreen)}
                    className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-all"
                  >
                    {fullscreen ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 overflow-auto p-4 sm:p-5">
                {currentError && !currentText ? (
                  <div className="flex items-start gap-3 text-rose-300">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">
                        {t("extractionError")}
                      </p>
                      <p className="text-xs text-rose-400/70 mt-1 font-mono break-all">
                        {currentError}
                      </p>
                    </div>
                  </div>
                ) : currentText ? (
                  <pre className="text-xs sm:text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {currentText}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10 text-zinc-600">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 mb-3 opacity-30" />
                    <p className="text-xs sm:text-sm text-center px-4">
                      {t("noText")}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* PDF Previewer Panel */}
          <AnimatePresence>
            {showPdfPreview && !fullscreen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col flex-1 rounded-2xl border border-white/[0.06] bg-[#0a0a12] overflow-hidden shadow-2xl min-h-[400px] lg:min-h-0"
              >
                <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-indigo-500/5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-semibold text-zinc-200">
                      {t("pdfPreview")}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPdfPreview(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <iframe
                  src={`${pdfUrl}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fullscreen backdrop */}
        {fullscreen && (
          <div
            className="fixed inset-0 bg-black/80 z-40"
            onClick={() => setFullscreen(false)}
          />
        )}

        {/* Phase 2 - AI Analysis Section */}
        {analysis.ai_score === null && (
          <AnimatePresence mode="wait">
            {selectedMode === null ? (
              <AnalysisModeSelector
                key="mode-selector"
                onSelectMode={setSelectedMode}
              />
            ) : selectedMode === "general" ? (
              <GeneralAnalysisForm
                key="general-form"
                onSubmit={handleGeneralAnalysis}
                onBack={() => setSelectedMode(null)}
                loading={loadingAI}
                error={aiError}
                hasAIApiKey={hasAIApiKey}
                onOpenSettings={onOpenSettings}
                onAnalyzeWithExternalChat={handleExternalChatAnalysis}
              />
            ) : (
              <JobMatchForm
                key="job-match-form"
                onSubmit={handleJobMatchAnalysis}
                onBack={() => setSelectedMode(null)}
                loading={loadingAI}
                error={aiError}
                hasAIApiKey={hasAIApiKey}
                onOpenSettings={onOpenSettings}
              />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
