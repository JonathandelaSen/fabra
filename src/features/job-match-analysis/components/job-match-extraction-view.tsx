"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/errors";
import type { JobMatchAnalysisDetail } from "../api/job-match-analysis-api";
import type { JobMatchAnalysisDetailResponse } from "@/app/api/job-match-analyses/responses";
import HowAtsWorksEducationBanner from "@/components/shared/how-ats-works-education-banner";
import JobMatchForm from "./job-match-form";
import JobMatchScoreCopyPasteModal from "./job-match-score-copy-paste-modal";
import { JobMatchExtractionTextPanel } from "./job-match-extraction-text-panel";
import JobMatchExtractionHeader from "./job-match-extraction-header";
import JobMatchExtractionParserTabs from "./job-match-extraction-parser-tabs";
import JobMatchExtractionPdfPreview from "./job-match-extraction-pdf-preview";

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
      <JobMatchExtractionHeader
        filename={analysis.filename}
        analysisId={analysis.id}
        aiScore={analysis.aiScore}
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
          onRun: () =>
            handleJobMatchAnalysis(
              analysis.jobDescription ?? "",
              analysis.jobUrl ?? "",
              selectedModel,
            ),
          onConfigure: onOpenSettings,
          onOpenCopyPaste: () => {
            setCopyPasteJobDescription(analysis.jobDescription ?? "");
            setCopyPasteJobUrl(analysis.jobUrl ?? null);
            setCopyPasteOpen(true);
          },
        }}
      />

      <div className="flex-1 flex flex-col overflow-auto p-4 sm:p-6 gap-4 sm:gap-6">
        <HowAtsWorksEducationBanner />

        <JobMatchExtractionParserTabs
          parsers={PARSERS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getTextForTab={getTextForTab}
          getErrorForTab={getErrorForTab}
        />

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

          <JobMatchExtractionPdfPreview
            showPdfPreview={showPdfPreview}
            fullscreen={fullscreen}
            pdfUrl={pdfUrl}
            onClose={() => setShowPdfPreview(false)}
          />
        </div>

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
