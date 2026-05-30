import type { AnalysisMode, AIContext } from "@/lib/analysis-types";
import AnalysisModeSelector from "./analysis-mode-selector";
import GeneralAnalysisForm from "./general-analysis-form";
import JobMatchForm from "./job-match-form";

interface ExtractionAIAnalysisSectionProps {
  aiError: string | null;
  aiScore: number | null;
  hasAIApiKey: boolean;
  hideAnalysisSelector: boolean;
  loadingAI: boolean;
  selectedMode: AnalysisMode | null;
  onAnalyzeWithExternalChat: (context: AIContext) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onSelectMode: (mode: AnalysisMode) => void;
  onSubmitGeneral: (context: AIContext, model: string) => void;
  onSubmitJobMatch: (
    jobDescription: string,
    jobUrl: string,
    model: string,
  ) => void;
}

export default function ExtractionAIAnalysisSection({
  aiError,
  aiScore,
  hasAIApiKey,
  hideAnalysisSelector,
  loadingAI,
  selectedMode,
  onAnalyzeWithExternalChat,
  onBack,
  onOpenSettings,
  onSelectMode,
  onSubmitGeneral,
  onSubmitJobMatch,
}: ExtractionAIAnalysisSectionProps) {
  if (aiScore !== null || hideAnalysisSelector) return null;

  if (selectedMode === null) {
    return <AnalysisModeSelector onSelectMode={onSelectMode} />;
  }

  if (selectedMode === "general") {
    return (
      <GeneralAnalysisForm
        onSubmit={onSubmitGeneral}
        onBack={onBack}
        loading={loadingAI}
        error={aiError}
        hasAIApiKey={hasAIApiKey}
        onOpenSettings={onOpenSettings}
        onAnalyzeWithExternalChat={onAnalyzeWithExternalChat}
      />
    );
  }

  return (
    <JobMatchForm
      onSubmit={onSubmitJobMatch}
      onBack={onBack}
      loading={loadingAI}
      error={aiError}
      hasAIApiKey={hasAIApiKey}
      onOpenSettings={onOpenSettings}
    />
  );
}
