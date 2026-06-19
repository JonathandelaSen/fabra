import type { AIContext } from "@/lib/analysis-types";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";
import GeneralAnalysisForm from "./forms/general-analysis-form";

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
  onAnalyzeWithExternalChat: (context: AIContext) => void;
  onOpenSettings: () => void;
  onSubmitGeneral: (context: AIContext) => void;
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
  onAnalyzeWithExternalChat,
  onOpenSettings,
  onSubmitGeneral,
}: ExtractionAIAnalysisSectionProps) {
  if (aiScore !== null || hideAnalysisSelector) return null;

  return (
    <GeneralAnalysisForm
      selectedProvider={selectedProvider}
      onProviderChange={onProviderChange}
      selectedModel={selectedModel}
      onModelChange={onModelChange}
      onSubmit={onSubmitGeneral}
      loading={loadingAI}
      error={aiError}
      hasAIApiKey={hasAIApiKey}
      onOpenSettings={onOpenSettings}
      onAnalyzeWithExternalChat={onAnalyzeWithExternalChat}
    />
  );
}
