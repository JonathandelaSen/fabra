"use client";

import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { useTranslations } from "next-intl";

import type { StoredAIProvider } from "@/lib/browser-preferences";

interface GeneralAnalysisActionLauncherProps {
  loading: boolean;
  hasAIApiKey: boolean;
  selectedProvider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSubmit: () => void;
  onOpenSettings: () => void;
  onAnalyzeWithExternalChat: () => void;
}

export function GeneralAnalysisActionLauncher({
  loading,
  hasAIApiKey,
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
  onSubmit,
  onOpenSettings,
  onAnalyzeWithExternalChat,
}: GeneralAnalysisActionLauncherProps) {
  const t = useTranslations("analysisFlow.forms");

  return (
    <div className="w-full flex justify-end">
      <AIActionLauncher
        actionLabel={t("analyzeCV")}
        loading={loading}
        integrated={{
          available: hasAIApiKey,
          selectedProvider,
          onProviderChange,
          selectedModelId: selectedModel,
          onModelChange,
          onRun: onSubmit,
          onConfigure: onOpenSettings,
        }}
        copyPaste={{
          available: true,
          onOpenFlow: onAnalyzeWithExternalChat,
        }}
      />
    </div>
  );
}
