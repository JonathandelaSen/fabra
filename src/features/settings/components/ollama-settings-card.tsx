"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Cpu, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DeleteButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { cn } from "@/lib/utils";
import {
  getStoredAIApiKeyForProvider,
  getStoredAIBaseUrlForProvider,
  getStoredAIModel,
  getStoredAIModelForProvider,
  saveStoredAIBaseUrlForProvider,
  saveStoredAIModelForProvider,
  type StoredAIProvider,
  AI_PROVIDER,
} from "@/lib/browser-preferences";

interface OllamaSettingsCardProps {
  aiProvider: StoredAIProvider;
  getSummary: (value: string) => string;
  onAISettingsChange: (settings: {
    provider: StoredAIProvider;
    apiKey: string;
    baseUrl?: string;
    model: string;
  }) => void;
}

export function OllamaSettingsCard({
  aiProvider,
  getSummary,
  onAISettingsChange,
}: OllamaSettingsCardProps) {
  const t = useTranslations("settings.apiKey");
  const common = useTranslations("common");
  const urlInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const urlDirtyRef = useRef(false);
  const modelDirtyRef = useRef(false);
  const [state, setState] = useState({
    url: "",
    draftUrl: "",
    model: "",
    draftModel: "",
    saved: false,
  });

  useEffect(() => {
    const storedUrl = getStoredAIBaseUrlForProvider(AI_PROVIDER.OLLAMA);
    const storedModel = getStoredAIModelForProvider(AI_PROVIDER.OLLAMA);
    setState((prev) => ({
      ...prev,
      url: storedUrl,
      draftUrl: urlDirtyRef.current ? prev.draftUrl : storedUrl,
      model: storedModel,
      draftModel: modelDirtyRef.current ? prev.draftModel : storedModel,
    }));
  }, [aiProvider]);

  const updateState = (updates: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    const draftUrl = urlInputRef.current?.value ?? state.draftUrl;
    const draftModel = modelInputRef.current?.value ?? state.draftModel;

    saveStoredAIBaseUrlForProvider(AI_PROVIDER.OLLAMA, draftUrl);
    saveStoredAIModelForProvider(AI_PROVIDER.OLLAMA, draftModel);
    urlDirtyRef.current = false;
    modelDirtyRef.current = false;
    updateState({
      url: draftUrl,
      draftUrl,
      model: draftModel,
      draftModel,
      saved: true,
    });
    setTimeout(() => updateState({ saved: false }), 2200);

    onAISettingsChange({
      provider: aiProvider,
      apiKey: getStoredAIApiKeyForProvider(aiProvider),
      baseUrl: getStoredAIBaseUrlForProvider(aiProvider),
      model: aiProvider === AI_PROVIDER.OLLAMA ? draftModel : getStoredAIModel(),
    });
  };

  const handleDelete = () => {
    saveStoredAIBaseUrlForProvider(AI_PROVIDER.OLLAMA, "");
    saveStoredAIModelForProvider(AI_PROVIDER.OLLAMA, "");
    urlDirtyRef.current = false;
    modelDirtyRef.current = false;
    updateState({
      url: "",
      draftUrl: "",
      model: "",
      draftModel: "",
      saved: false,
    });

    onAISettingsChange({
      provider: aiProvider,
      apiKey: getStoredAIApiKeyForProvider(aiProvider),
      baseUrl: getStoredAIBaseUrlForProvider(aiProvider),
      model: getStoredAIModel(),
    });
  };

  const isOllamaActive = !!state.url && !!state.model;

  return (
    <div className={cn(
      "rounded-xl border p-5 flex flex-col justify-between transition-all duration-300",
      isOllamaActive
        ? "border-success-border bg-panel-active shadow-[var(--ui-success-shadow)] hover:border-success-border"
        : "border-line bg-panel-elevated/40 opacity-65 hover:opacity-85"
    )}>
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-text-muted" />
            <h4 className="text-sm font-semibold text-text-main">
              {t("ollamaSectionTitle")}
            </h4>
          </div>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1.5",
            isOllamaActive
              ? "bg-success/10 text-success-text border-success-border"
              : "bg-panel-control/10 text-text-muted border-line-default",
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", isOllamaActive ? "bg-success animate-pulse" : "bg-panel-control")} />
            {isOllamaActive ? `${getSummary(state.url)} (${state.model})` : common("states.notConfigured")}
          </span>
        </div>
        <div className="relative mb-3">
          <label className="text-[10px] uppercase font-bold text-text-muted block mb-1">
            {t("ollamaBaseUrlLabel")}
          </label>
          <input
            type="text"
            ref={urlInputRef}
            value={state.draftUrl}
            onChange={(event) => {
              urlDirtyRef.current = true;
              updateState({ draftUrl: event.target.value });
            }}
            placeholder={t("ollamaPlaceholder")}
            className="h-10 w-full rounded-xl border border-line bg-field px-3 text-xs text-text-main outline-none transition-all placeholder:text-text-faint focus:border-ring/40 focus:ring-2 focus:ring-ring/10"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="relative mb-4">
          <label className="text-[10px] uppercase font-bold text-text-muted block mb-1">
            {t("ollamaModelLabel")}
          </label>
          <input
            type="text"
            ref={modelInputRef}
            value={state.draftModel}
            onChange={(event) => {
              modelDirtyRef.current = true;
              updateState({ draftModel: event.target.value });
            }}
            placeholder={t("ollamaModelPlaceholder")}
            className="h-10 w-full rounded-xl border border-line bg-field px-3 text-xs text-text-main outline-none transition-all placeholder:text-text-faint focus:border-ring/40 focus:ring-2 focus:ring-ring/10"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <IconTextButton
          icon={state.saved ? Check : Save}
          onClick={handleSave}
          disabled={!state.draftUrl.trim()}
          tone={ICON_TEXT_BUTTON_TONES.PRIMARY_GRADIENT}
          strong
          className="h-9 text-xs py-0 px-3 flex-1"
        >
          {state.saved ? common("actions.saved") : common("actions.save")}
        </IconTextButton>
        <DeleteButton
          type="button"
          onClick={handleDelete}
          disabled={!state.url && !state.draftUrl}
          strong
          className="h-9 text-xs py-0 px-3"
        >
          {common("actions.delete")}
        </DeleteButton>
      </div>
    </div>
  );
}
