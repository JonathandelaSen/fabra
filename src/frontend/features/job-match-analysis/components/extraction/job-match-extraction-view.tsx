"use client";

import { type ComponentProps, useState } from "react";
import { useTranslations } from "next-intl";
import { copyToClipboard } from "@/frontend/utils/clipboard";
import HowAtsWorksEducationBanner from "@/frontend/components/shared/how-ats-works-education-banner";
import JobMatchForm from "./job-match-form";
import JobMatchScoreCopyPasteModal from "../copy-paste/job-match-score-copy-paste-modal";
import { ExtractionTextPanel as JobMatchExtractionTextPanel } from "@/frontend/components/shared/extraction/extraction-text-panel";
import JobMatchExtractionHeader from "@/frontend/components/shared/extraction/extraction-header";
import JobMatchExtractionParserTabs from "@/frontend/components/shared/extraction/extraction-parser-tabs";
import JobMatchExtractionPdfPreview from "./job-match-extraction-pdf-preview";
import { useJobMatchScoringState } from "../../hooks/use-job-match-scoring-state";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";

type ScoreInput = { jobDescription: string; jobUrl: string; provider: StoredAIProvider; model: string };
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ScoreFn { (input: ScoreInput): Promise<void> }

interface ExtractionAnalysis {
  id: string;
  filename: string;
  cvId: string | null;
  cv?: { type?: string } | null;
  aiScore: number | null;
  jobDescription: string | null;
  jobUrl: string | null;
  textPython: string | null;
  textPdfjs: string | null;
  textNode: string | null;
  extractErrorPython: string | null;
  extractErrorPdfjs: string | null;
  extractErrorNode: string | null;
}

interface JobMatchExtractionViewProps {
  analysis: ExtractionAnalysis;
  onScore: ScoreFn;
  hasAIApiKey: boolean;
  onOpenSettings: () => void;
  onCopyPasteApplied: ComponentProps<typeof JobMatchScoreCopyPasteModal>["onApplied"];
  hideAnalysisSelector?: boolean;
}

type ParserTab = "python" | "pdfjs" | "node";

const PARSERS: {
  key: ParserTab;
  labelKey: string;
  descriptionKey: ParserTab;
  color: string;
  badgeKey: string;
  badgeColor: string;
}[] = [
  {
    key: "python",
    labelKey: "parserLabels.python",
    descriptionKey: "python",
    color: "bg-success",
    badgeKey: "parserBadges.python",
    badgeColor: "bg-success/10 text-success-text border-success-border",
  },
  {
    key: "pdfjs",
    labelKey: "parserLabels.pdfjs",
    descriptionKey: "pdfjs",
    color: "bg-info",
    badgeKey: "parserBadges.pdfjs",
    badgeColor: "bg-info/10 text-info-text border-info-border/20",
  },
  {
    key: "node",
    labelKey: "parserLabels.node",
    descriptionKey: "node",
    color: "bg-warning",
    badgeKey: "parserBadges.node",
    badgeColor: "bg-warning/10 text-warning-text border-warning-border",
  },
];

export default function JobMatchExtractionView({
  analysis,
  onScore,
  hasAIApiKey,
  onOpenSettings,
  onCopyPasteApplied,
  hideAnalysisSelector = false,
}: JobMatchExtractionViewProps) {
  const formsT = useTranslations("analysisFlow.forms");
  const [activeTab, setActiveTab] = useState<ParserTab>("python");
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const scoring = useJobMatchScoringState({ onScore, hasAIApiKey });

  const getTextForTab = (tab: ParserTab) => {
    switch (tab) {
      case "python": return analysis.textPython;
      case "pdfjs": return analysis.textPdfjs;
      case "node": return analysis.textNode;
    }
  };

  const getErrorForTab = (tab: ParserTab) => {
    switch (tab) {
      case "python": return analysis.extractErrorPython;
      case "pdfjs": return analysis.extractErrorPdfjs;
      case "node": return analysis.extractErrorNode;
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
    await copyToClipboard(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col">
      <JobMatchExtractionHeader
        filename={analysis.filename}
        analysisId={analysis.id}
        actionLabel={formsT("compareOffer")}
        showReAnalysis={true}
        aiScore={analysis.aiScore}
        showPdfPreview={showPdfPreview}
        onTogglePdfPreview={() => setShowPdfPreview(!showPdfPreview)}
        pdfUrl={pdfUrl}
        wordCount={wordCount}
        charCount={charCount}
        reAnalysis={{
          loading: scoring.loadingAI,
          hasAIApiKey,
          selectedProvider: scoring.selectedProvider,
          onProviderChange: scoring.setSelectedProvider,
          selectedModel: scoring.selectedModel,
          onModelChange: scoring.setSelectedModel,
          onRun: () =>
            scoring.handleJobMatchAnalysis(
              analysis.jobDescription ?? "",
              analysis.jobUrl ?? "",
              scoring.selectedProvider,
              scoring.selectedModel,
            ),
          onConfigure: onOpenSettings,
          onOpenCopyPaste: () =>
            scoring.openCopyPaste(
              analysis.jobDescription ?? "",
              analysis.jobUrl ?? null,
            ),
        }}
      />

      <div className="flex flex-col py-4 sm:py-6 gap-4 sm:gap-6">
        <HowAtsWorksEducationBanner />

        <JobMatchExtractionParserTabs
          parsers={PARSERS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getTextForTab={getTextForTab}
          getErrorForTab={getErrorForTab}
        />

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
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
            className="fixed inset-0 bg-scrim z-40"
            onClick={() => setFullscreen(false)}
          />
        )}

        {analysis.aiScore === null && !hideAnalysisSelector && (
          <JobMatchForm
            key="job-match-form"
            onSubmit={scoring.handleJobMatchAnalysis}
            onBack={() => {}}
            loading={scoring.loadingAI}
            error={scoring.aiError}
            hasAIApiKey={hasAIApiKey}
            onOpenSettings={onOpenSettings}
            onCopyPasteOpen={(desc, url) =>
              scoring.openCopyPaste(desc, url || null)
            }
          />
        )}

        <JobMatchScoreCopyPasteModal
          analysisId={analysis.id}
          jobDescription={scoring.copyPasteJobDescription}
          jobUrl={scoring.copyPasteJobUrl}
          open={scoring.copyPasteOpen}
          onClose={scoring.closeCopyPaste}
          onApplied={onCopyPasteApplied}
        />
      </div>
    </div>
  );
}
