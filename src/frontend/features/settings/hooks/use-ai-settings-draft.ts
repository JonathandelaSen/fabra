"use client";

import { useMemo, useState } from "react";
import {
  removeStoredAISettings,
  saveStoredAISettings,
  type StoredAIProvider,
} from "@/frontend/utils/browser-preferences";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/utils/ai-models";

interface AISettingsDraftParams {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  onAISettingsChange: (settings: {
    provider: StoredAIProvider;
    apiKey: string;
    model: string;
  }) => void;
  notConfiguredLabel: string;
  configuredLabel: string;
}

export function useAISettingsDraft({
  aiProvider,
  aiApiKey,
  aiModel,
  onAISettingsChange,
  notConfiguredLabel,
  configuredLabel,
}: AISettingsDraftParams) {
  const [draftValue, setDraftValue] = useState<string | null>(null);
  const [draftProvider, setDraftProvider] =
    useState<StoredAIProvider>(aiProvider);
  const [draftModel, setDraftModel] = useState(aiModel);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputValue = draftValue ?? aiApiKey;

  const keySummary = useMemo(() => {
    if (!aiApiKey) return notConfiguredLabel;
    if (aiApiKey.length <= 12) return configuredLabel;
    return `${aiApiKey.slice(0, 6)}...${aiApiKey.slice(-4)}`;
  }, [aiApiKey, configuredLabel, notConfiguredLabel]);

  const save = () => {
    const settings = saveStoredAISettings({
      provider: draftProvider,
      apiKey: inputValue,
      model: draftModel,
    });
    onAISettingsChange(settings);
    setDraftValue(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const remove = () => {
    removeStoredAISettings();
    onAISettingsChange({
      provider: "gemini",
      apiKey: "",
      model: DEFAULT_GEMINI_MODEL,
    });
    setDraftValue("");
    setSaved(false);
  };

  return {
    draftProvider,
    setDraftProvider,
    draftModel,
    setDraftModel,
    inputValue,
    setDraftValue,
    showKey,
    setShowKey,
    saved,
    keySummary,
    save,
    remove,
  };
}
