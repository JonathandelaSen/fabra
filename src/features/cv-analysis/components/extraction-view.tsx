"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import type { AnalysisMode, AIContext } from "@/lib/analysis-types";
import HowAtsWorksEducationBanner from "@/components/shared/how-ats-works-education-banner";
import ExtractionHeader from "@/components/shared/extraction/extraction-header";
import ExtractionParserTabs from "@/components/shared/extraction/extraction-parser-tabs";
import ExtractionPdfPreview from "./extraction-pdf-preview";
import AnalysisModeSelector from "./analysis-mode-selector";
import CVScoreCopyPasteModal from "./cv-score-copy-paste-modal";
import GeneralAnalysisForm from "./general-analysis-form";
import JobMatchForm from "./job-match-form";
import { ExtractionTextPanel as CvExtractionTextPanel } from "@/components/shared/extraction/extraction-text-panel";
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
  hideAnalysisSelector?: boolean;
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
  hideAnalysisSelector = false,
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
      <ExtractionHeader
        filename={analysis.filename}
        analysisId={analysis.id}
        actionLabel={formsT("analyzeCV")}
        showReAnalysis={analysis.analysis_mode === "general"}
        aiScore={analysis.ai_score}
        showPdfPreview={showPdfPreview}
        onTogglePdfPreview={() => setShowPdfPreview(!showPdfPreview)}
        pdfUrl={pdfUrl}
        wordCount={wordCount}
        charCount={charCount}
        reAnalysis={{
          loading: loadingAI,
          hasAIApiKey,
          selectedModel,
          models,
          onModelChange: setSelectedModel,
          onRun: () => handleGeneralAnalysis({}, selectedModel),
          onConfigure: onOpenSettings,
          onOpenCopyPaste: () => {
            setCopyPasteContext(null);
            setCopyPasteOpen(true);
          },
        }}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-auto p-4 sm:p-6 gap-4 sm:gap-6">
        {/* Educational Banner */}
        <HowAtsWorksEducationBanner />

        <ExtractionParserTabs
          parsers={PARSERS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getTextForTab={getTextForTab}
          getErrorForTab={getErrorForTab}
        />

        {/* Text Content Area & PDF Preview Side-by-Side */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-0">
          <CvExtractionTextPanel
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

          <ExtractionPdfPreview
            showPdfPreview={showPdfPreview}
            fullscreen={fullscreen}
            pdfUrl={pdfUrl}
            onClose={() => setShowPdfPreview(false)}
          />
        </div>

        {/* Fullscreen backdrop */}
        {fullscreen && (
          <div
            className="fixed inset-0 bg-black/80 z-40"
            onClick={() => setFullscreen(false)}
          />
        )}

        {/* Phase 2 - AI Analysis Section */}
        {analysis.ai_score === null && !hideAnalysisSelector && (
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
