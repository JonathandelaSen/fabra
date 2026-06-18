"use client";

import { useTranslations } from "next-intl";
import {
  DEFAULT_GEMINI_MODEL, 
  CHEAPEST_OPENAI_MODEL,
  GEMINI_MODELS, 
  OPENAI_MODELS 
} from "@/frontend/ai-models";
import { Sparkles } from "lucide-react";
import {
  getStoredAIModelForProvider,
  saveStoredAIProvider,
  getStoredAIApiKeyForProvider,
  getStoredAIBaseUrlForProvider,
  AI_PROVIDER,
  type StoredAIProvider,
} from "@/lib/browser-preferences";

interface ChatHeaderProps {
  provider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  model: string;
  onModelChange: (model: string) => void;
}

export function ChatHeader({ provider, onProviderChange, model, onModelChange }: ChatHeaderProps) {
  const t = useTranslations("analysisDetail.chat");
  const commonT = useTranslations("common.providers");

  const isGeminiActive = !!getStoredAIApiKeyForProvider(AI_PROVIDER.GEMINI);
  const isOpenaiActive = !!getStoredAIApiKeyForProvider(AI_PROVIDER.OPENAI);
  const isOllamaActive = !!getStoredAIBaseUrlForProvider(AI_PROVIDER.OLLAMA) && !!getStoredAIModelForProvider(AI_PROVIDER.OLLAMA);
  const isMockActive = process.env.NODE_ENV !== "production";

  const handleProviderChange = (newProvider: StoredAIProvider) => {
    saveStoredAIProvider(newProvider);
    onProviderChange(newProvider);
    if (newProvider === "gemini") {
      onModelChange(DEFAULT_GEMINI_MODEL);
    } else if (newProvider === "openai") {
      onModelChange(CHEAPEST_OPENAI_MODEL);
    } else if (newProvider === "ollama") {
      onModelChange(getStoredAIModelForProvider("ollama"));
    } else {
      onModelChange("mock-model");
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-line/[0.06] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-info-soft to-info-soft text-info-text">
          <Sparkles className="size-3.5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text-soft">
            {t("title")}
          </h4>
          <p className="text-[11px] text-text-faint">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={provider}
          onChange={(event) => handleProviderChange(event.target.value as StoredAIProvider)}
          className="h-8 rounded-lg border border-line/[0.08] bg-panel/[0.03] px-2.5 text-[11px] text-text-muted outline-none transition-colors hover:border-line/[0.12] focus:border-info-border"
        >
          {(isGeminiActive || provider === "gemini") && <option value="gemini">{commonT("gemini")}</option>}
          {(isOpenaiActive || provider === "openai") && <option value="openai">{commonT("openai")}</option>}
          {(isOllamaActive || provider === "ollama") && <option value="ollama">{commonT("ollama")}</option>}
          {(isMockActive || provider === "mock") && <option value="mock">{commonT("mock")}</option>}
        </select>
        <select
          value={model}
          onChange={(event) => onModelChange(event.target.value)}
          aria-label={t("modelLabel")}
          className="h-8 max-w-[140px] truncate rounded-lg border border-line/[0.08] bg-panel/[0.03] px-2.5 text-[11px] text-text-muted outline-none transition-colors hover:border-line/[0.12] focus:border-info-border"
        >
          {provider === "gemini" && (
            Object.entries(GEMINI_MODELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))
          )}
          {provider === "openai" && (
            Object.entries(OPENAI_MODELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))
          )}
          {provider === "ollama" && (
            <option value={model}>{model || "Model not configured"}</option>
          )}
          {provider === "mock" && (
            <option value="mock-model">{commonT("mockModel")}</option>
          )}
        </select>
      </div>
    </div>
  );
}
