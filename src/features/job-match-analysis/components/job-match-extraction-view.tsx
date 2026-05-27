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
import type { JobMatchAnalysisDetail } from "../api/job-match-analysis-api";
import type { JobMatchAnalysisDetailResponse } from "@/app/api/job-match-analyses/responses";
import AIActionLauncher from "@/components/shared/ai-action-launcher";
import HowAtsWorksEducationBanner from "@/components/shared/how-ats-works-education-banner";
import JobMatchForm from "./job-match-form";
import JobMatchScoreCopyPasteModal from "./job-match-score-copy-paste-modal";
import { JobMatchExtractionTextPanel } from "./job-match-extraction-text-panel";

interface JobMatchExtractionViewProps {
  analysis: JobMatchAnalysisDetail;
  onScore: (input: { jobDescription: string; jobUrl: string; model: string }) => Promise<void>;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onCopyPasteApplied: (analysis: JobMatchAnalysisDetailResponse) => void;
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

export default function JobMatchExtractionView({
  analysis,
  onScore,
  hasAIApiKey,
  onOpenSettings,
  onCopyPasteApplied,
}: JobMatchExtractionViewProps) {
  const t = useTranslations("analysisFlow.extraction");
  const formsT = useTranslations("analysisFlow.forms");
  const [activeTab, setActiveTab] = useState<ParserTab>("python");
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copyPasteOpen, setCopyPasteOpen] = useState(false);
  const [copyPasteJobDescription, setCopyPasteJobDescription] = useState("");
  const [copyPasteJobUrl, setCopyPasteJobUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  const models = [
    { id: "gemini-2.5-flash", label: `Gemini 2.5 Flash (${formsT("fast")})` },
    { id: "gemini-3.1-pro-preview", label: `Gemini 3.1 Pro Preview (${formsT("powerful")})` },
  ];

  const getTextForTab = (tab: ParserTab) => {
    switch (tab) {
      case "python":
        return analysis.textPython;
      case "pdfjs":
        return analysis.textPdfjs;
      case "node":
        return analysis.textNode;
    }
  };

  const getErrorForTab = (tab: ParserTab) => {
    switch (tab) {
      case "python":
        return analysis.extractErrorPython;
      case "pdfjs":
        return analysis.extractErrorPdfjs;
      case "node":
        return analysis.extractErrorNode;
    }
  };

  const currentText = getTextForTab(activeTab);
  const currentError = getErrorForTab(activeTab);
  const pdfUrl = analysis.cvId
    ? analysis.cv?.type === "template"
      ? `/api/cvs/${analysis.cvId}/template-pdf`
      : `/api/cvs/${analysis.cvId}/pdf`
    : `/api/job-match-analyses/${analysis.id}/pdf`;

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
      await onScore({ jobDescription, jobUrl, model });
    } catch (err: unknown) {
      setAiError(getErrorMessage(err));
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
              {analysis.aiScore !== null && (
                <AIActionLauncher
                  actionLabel={formsT("compareOffer")}
                  loading={loadingAI}
                  integrated={{
                    available: hasAIApiKey,
                    selectedModelId: selectedModel,
                    models,
                    onModelChange: setSelectedModel,
                    onRun: () => handleJobMatchAnalysis(analysis.jobDescription ?? "", analysis.jobUrl ?? "", selectedModel),
                    onConfigure: onOpenSettings,
                  }}
                  copyPaste={{
                    available: true,
                    onOpenFlow: () => {
                      setCopyPasteJobDescription(analysis.jobDescription ?? "");
                      setCopyPasteJobUrl(analysis.jobUrl ?? null);
                      setCopyPasteOpen(true);
                    },
                  }}
                />
              )}
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
          <JobMatchExtractionTextPanel
            activeTab={activeTab}
            currentText={currentText}
            currentError={currentError}
            copied={copied}
            fullscreen={fullscreen}
            parserColor={PARSERS.find((p) => p.key === activeTab)?.color}
            parserDescriptionKey={PARSERS.find((p) => p.key === activeTab)?.descriptionKey ?? "python"}
            onCopy={handleCopy}
            onToggleFullscreen={() => setFullscreen(!fullscreen)}
          />

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

        {analysis.aiScore === null && (
          <JobMatchForm
            key="job-match-form"
            onSubmit={handleJobMatchAnalysis}
            onBack={() => {}}
            loading={loadingAI}
            error={aiError}
            hasAIApiKey={hasAIApiKey}
            onOpenSettings={onOpenSettings}
            onCopyPasteOpen={(desc, url) => {
              setCopyPasteJobDescription(desc);
              setCopyPasteJobUrl(url || null);
              setCopyPasteOpen(true);
            }}
          />
        )}

        <JobMatchScoreCopyPasteModal
          analysisId={analysis.id}
          jobDescription={copyPasteJobDescription}
          jobUrl={copyPasteJobUrl}
          open={copyPasteOpen}
          onClose={() => setCopyPasteOpen(false)}
          onApplied={onCopyPasteApplied}
        />
      </div>
    </div>
  );
}
