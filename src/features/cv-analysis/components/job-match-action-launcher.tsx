"use client";

import AIActionLauncher from "@/components/shared/ai-action-launcher";
import { useTranslations } from "next-intl";

interface JobMatchActionLauncherProps {
  loading: boolean;
  disabled: boolean;
  hasAIApiKey: boolean;
  selectedModel: string;
  models: Array<{ id: string; label: string }>;
  onModelChange: (model: string) => void;
  onSubmit: () => void;
  onOpenSettings: () => void;
}

export function JobMatchActionLauncher({
  loading,
  disabled,
  hasAIApiKey,
  selectedModel,
  models,
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
          selectedModelId: selectedModel,
          models,
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
