"use client";

import { type ComponentProps, useState } from "react";
import { useTranslations } from "next-intl";
import HowAtsWorksEducationBanner from "@/components/shared/how-ats-works-education-banner";
import JobMatchForm from "./job-match-form";
import JobMatchScoreCopyPasteModal from "./job-match-score-copy-paste-modal";
import { ExtractionTextPanel as JobMatchExtractionTextPanel } from "@/components/shared/extraction/extraction-text-panel";
import JobMatchExtractionHeader from "@/components/shared/extraction/extraction-header";
import JobMatchExtractionParserTabs from "@/components/shared/extraction/extraction-parser-tabs";
import JobMatchExtractionPdfPreview from "./job-match-extraction-pdf-preview";
import { useJobMatchScoringState } from "../hooks/use-job-match-scoring-state";
import type { StoredAIProvider } from "@/lib/browser-preferences";

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
    await navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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

      <div className="flex-1 flex flex-col overflow-auto px-2 py-4 sm:p-6 gap-4 sm:gap-6">
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
