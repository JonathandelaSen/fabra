"use client";

import { useTranslations } from "next-intl";
import {
  DEFAULT_GEMINI_MODEL, 
  CHEAPEST_OPENAI_MODEL,
  GEMINI_MODELS, 
  OPENAI_MODELS 
} from "@/frontend/ai-models";
import { Sparkles } from "lucide-react";
import { saveStoredAIProvider, type StoredAIProvider } from "@/lib/browser-preferences";

interface ChatHeaderProps {
  provider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  model: string;
  onModelChange: (model: string) => void;
}

export function ChatHeader({ provider, onProviderChange, model, onModelChange }: ChatHeaderProps) {
  const t = useTranslations("analysisDetail.chat");
  const commonT = useTranslations("common.providers");

  const handleProviderChange = (newProvider: StoredAIProvider) => {
    saveStoredAIProvider(newProvider);
    onProviderChange(newProvider);
    if (newProvider === "gemini") {
      onModelChange(DEFAULT_GEMINI_MODEL);
    } else if (newProvider === "openai") {
      onModelChange(CHEAPEST_OPENAI_MODEL);
    } else {
      onModelChange("mock-model");
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-400">
          <Sparkles className="size-3.5" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-zinc-200">
            {t("title")}
          </h4>
          <p className="text-[11px] text-zinc-600">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={provider}
          onChange={(event) => handleProviderChange(event.target.value as StoredAIProvider)}
          className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] text-zinc-400 outline-none transition-colors hover:border-white/[0.12] focus:border-cyan-500/30"
        >
          <option value="gemini">{commonT("gemini")}</option>
          <option value="openai">{commonT("openai")}</option>
          {process.env.NODE_ENV !== "production" && <option value="mock">{commonT("mock")}</option>}
        </select>
        <select
          value={model}
          onChange={(event) => onModelChange(event.target.value)}
          aria-label={t("modelLabel")}
          className="h-8 max-w-[140px] truncate rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11px] text-zinc-400 outline-none transition-colors hover:border-white/[0.12] focus:border-cyan-500/30"
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
          {provider === "mock" && (
            <option value="mock-model">{commonT("mockModel")}</option>
          )}
        </select>
      </div>
    </div>
  );
}
