"use client";

import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { useTranslations } from "next-intl";

interface GeneralAnalysisActionLauncherProps {
  loading: boolean;
  hasAIApiKey: boolean;
  selectedModel: string;
  models: Array<{ id: string; label: string }>;
  onModelChange: (model: string) => void;
  onSubmit: () => void;
  onOpenSettings: () => void;
  onAnalyzeWithExternalChat: () => void;
}

export function GeneralAnalysisActionLauncher({
  loading,
  hasAIApiKey,
  selectedModel,
  models,
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
          selectedModelId: selectedModel,
          models,
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
