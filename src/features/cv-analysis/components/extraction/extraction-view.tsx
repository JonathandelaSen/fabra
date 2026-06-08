"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { copyToClipboard } from "@/lib/clipboard";
import type { AnalysisMode } from "@/lib/analysis-types";
import HowAtsWorksEducationBanner from "@/components/shared/how-ats-works-education-banner";
import ExtractionHeader from "@/components/shared/extraction/extraction-header";
import CVScoreCopyPasteModal from "../copy-paste/cv-score-copy-paste-modal";
import { JobMatchScoreCopyPasteModal } from "@/features/job-match-analysis";
import {
  useExtractionAIActions,
  type ScoreAnalysisHandler,
} from "../../hooks/use-extraction-ai-actions";
import ExtractionAIAnalysisSection from "./extraction-ai-analysis-section";
import { type ParserTab } from "./extraction-parser-config";
import ExtractionWorkspace from "./extraction-workspace";
import type { StoredAIProvider } from "@/lib/browser-preferences";

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
    job_description?: string | null;
    cv?: {
      id?: string;
      name?: string;
      filename?: string;
      type?: string;
    } | null;
  };
  onAIAnalysisComplete: () => void;
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onScoreAnalysis?: ScoreAnalysisHandler;
  hideAnalysisSelector?: boolean;
}

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
  const formsT = useTranslations("analysisFlow.forms");
  const [activeTab, setActiveTab] = useState<ParserTab>("python");
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Analysis mode state
  const [selectedMode, setSelectedMode] = useState<AnalysisMode | null>(null);
  const {
    aiError,
    copyPasteContext,
    copyPasteOpen,
    copyPasteJobDescription,
    copyPasteJobUrl,
    loadingAI,
    selectedProvider,
    selectedModel,
    handleExternalChatAnalysis,
    handleJobMatchCopyPasteOpen,
    handleGeneralAnalysis,
    handleJobMatchAnalysis,
    setCopyPasteContext,
    setCopyPasteOpen,
    setSelectedProvider,
    setSelectedModel,
  } = useExtractionAIActions({
    analysisId: analysis.id,
    aiApiKey,
    aiModel,
    aiProvider,
    hasAIApiKey,
    onAIAnalysisComplete,
    onScoreAnalysis,
  });

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
    await copyToClipboard(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col">
      {analysis.analysis_mode === "job_match" ? (
        <JobMatchScoreCopyPasteModal
          analysisId={analysis.id}
          jobDescription={copyPasteJobDescription || analysis.job_description || ""}
          jobUrl={copyPasteJobUrl || analysis.job_url || null}
          open={copyPasteOpen}
          onClose={() => setCopyPasteOpen(false)}
          onApplied={() => {
            setCopyPasteOpen(false);
            onAIAnalysisComplete();
          }}
        />
      ) : (
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
      )}
      <ExtractionHeader
        filename={analysis.filename}
        analysisId={analysis.id}
        actionLabel={formsT("repeatAnalysis")}
        showReAnalysis={true}
        aiScore={analysis.ai_score}
        showPdfPreview={showPdfPreview}
        onTogglePdfPreview={() => setShowPdfPreview(!showPdfPreview)}
        pdfUrl={pdfUrl}
        wordCount={wordCount}
        charCount={charCount}
        reAnalysis={{
          loading: loadingAI,
          hasAIApiKey,
          selectedProvider,
          onProviderChange: setSelectedProvider,
          selectedModel,
          onModelChange: setSelectedModel,
          onRun: () =>
            analysis.analysis_mode === "job_match"
              ? handleJobMatchAnalysis(
                  analysis.job_description ?? "",
                  analysis.job_url ?? "",
                )
              : handleGeneralAnalysis({}),
          onConfigure: onOpenSettings,
          onOpenCopyPaste: () => {
            if (analysis.analysis_mode === "job_match") {
              handleJobMatchCopyPasteOpen(
                analysis.job_description ?? "",
                analysis.job_url ?? "",
              );
            } else {
              setCopyPasteContext(null);
              setCopyPasteOpen(true);
            }
          },
        }}
      />

      <div className="flex flex-col py-4 sm:py-6 gap-4 sm:gap-6">
        <HowAtsWorksEducationBanner />

        <ExtractionWorkspace
          activeTab={activeTab}
          copied={copied}
          currentError={currentError}
          currentText={currentText}
          fullscreen={fullscreen}
          getErrorForTab={getErrorForTab}
          getTextForTab={getTextForTab}
          onCopy={handleCopy}
          onTabChange={setActiveTab}
          onToggleFullscreen={() => setFullscreen(!fullscreen)}
          onClosePdfPreview={() => setShowPdfPreview(false)}
          pdfUrl={pdfUrl}
          showPdfPreview={showPdfPreview}
        />

        <ExtractionAIAnalysisSection
          aiScore={analysis.ai_score}
          aiError={aiError}
          hasAIApiKey={hasAIApiKey}
          hideAnalysisSelector={hideAnalysisSelector}
          loadingAI={loadingAI}
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          selectedMode={selectedMode}
          onAnalyzeWithExternalChat={handleExternalChatAnalysis}
          onBack={() => setSelectedMode(null)}
          onOpenSettings={onOpenSettings}
          onSelectMode={setSelectedMode}
          onSubmitGeneral={handleGeneralAnalysis}
          onSubmitJobMatch={handleJobMatchAnalysis}
          onCopyPasteJobMatch={handleJobMatchCopyPasteOpen}
        />
      </div>
    </div>
  );
}
