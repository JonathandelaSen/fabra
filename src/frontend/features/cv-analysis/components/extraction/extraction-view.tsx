"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { copyToClipboard } from "@/frontend/utils/clipboard";
import HowAtsWorksEducationBanner from "@/frontend/components/shared/how-ats-works-education-banner";
import ExtractionHeader from "@/frontend/components/shared/extraction/extraction-header";
import CVScoreCopyPasteModal from "../copy-paste/cv-score-copy-paste-modal";
import {
  useExtractionAIActions,
  type ScoreAnalysisHandler,
} from "../../hooks/use-extraction-ai-actions";
import ExtractionAIAnalysisSection from "./extraction-ai-analysis-section";
import { type ParserTab } from "./extraction-parser-config";
import ExtractionWorkspace from "./extraction-workspace";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";

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
    ai_score: number | null;
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

  const {
    aiError,
    copyPasteContext,
    copyPasteOpen,
    loadingAI,
    selectedProvider,
    selectedModel,
    handleExternalChatAnalysis,
    handleGeneralAnalysis,
    setCopyPasteContext,
    setCopyPasteOpen,
    setSelectedProvider,
    setSelectedModel,
  } = useExtractionAIActions({
    analysisId: analysis.id,
    aiApiKey,
    aiModel,
    aiProvider,
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
          onRun: () => handleGeneralAnalysis({}),
          onConfigure: onOpenSettings,
          onOpenCopyPaste: () => {
            setCopyPasteContext(null);
            setCopyPasteOpen(true);
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
          onAnalyzeWithExternalChat={handleExternalChatAnalysis}
          onOpenSettings={onOpenSettings}
          onSubmitGeneral={handleGeneralAnalysis}
        />
      </div>
    </div>
  );
}
