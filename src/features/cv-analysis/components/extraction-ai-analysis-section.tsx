import type { AnalysisMode, AIContext } from "@/lib/analysis-types";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import AnalysisModeSelector from "./analysis-mode-selector";
import GeneralAnalysisForm from "./general-analysis-form";
import JobMatchForm from "./job-match-form";

interface ExtractionAIAnalysisSectionProps {
  aiError: string | null;
  aiScore: number | null;
  hasAIApiKey: boolean;
  hideAnalysisSelector: boolean;
  loadingAI: boolean;
  selectedProvider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  selectedMode: AnalysisMode | null;
  onAnalyzeWithExternalChat: (context: AIContext) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  onSelectMode: (mode: AnalysisMode) => void;
  onSubmitGeneral: (context: AIContext) => void;
  onSubmitJobMatch: (
    jobDescription: string,
    jobUrl: string,
  ) => void;
}

export default function ExtractionAIAnalysisSection({
  aiError,
  aiScore,
  hasAIApiKey,
  hideAnalysisSelector,
  loadingAI,
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
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
        selectedProvider={selectedProvider}
        onProviderChange={onProviderChange}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
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
      selectedProvider={selectedProvider}
      onProviderChange={onProviderChange}
      selectedModel={selectedModel}
      onModelChange={onModelChange}
      onSubmit={onSubmitJobMatch}
      onBack={onBack}
      loading={loadingAI}
      error={aiError}
      hasAIApiKey={hasAIApiKey}
      onOpenSettings={onOpenSettings}
    />
  );
}
