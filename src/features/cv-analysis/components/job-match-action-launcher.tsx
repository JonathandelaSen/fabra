"use client";

import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { useTranslations } from "next-intl";

import type { StoredAIProvider } from "@/lib/browser-preferences";

interface JobMatchActionLauncherProps {
  loading: boolean;
  disabled: boolean;
  hasAIApiKey: boolean;
  selectedProvider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSubmit: () => void;
  onOpenSettings: () => void;
}

export function JobMatchActionLauncher({
  loading,
  disabled,
  hasAIApiKey,
  selectedProvider,
  onProviderChange,
  selectedModel,
  onModelChange,
  onSubmit,
  onOpenSettings,
}: JobMatchActionLauncherProps) {
  const t = useTranslations("analysisFlow.forms");

  return (
    <div className="w-full pt-2 flex justify-end">
      <AIActionLauncher
        actionLabel={t("compareOffer")}
        loading={loading}
        disabled={disabled}
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
          available: false,
          onOpenFlow: () => {},
        }}
      />
    </div>
  );
}
