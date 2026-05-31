"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  Sparkles,
  Cpu,
} from "lucide-react";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import {
  DeleteButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import { BasicPanel } from "@/components/shared/basic-panel";
import { cn } from "@/lib/utils";
import {
  getStoredAIApiKeyForProvider,
  saveStoredAIApiKeyForProvider,
  getStoredAIBaseUrlForProvider,
  getStoredAIModel,
  type StoredAIProvider,
  AI_PROVIDER,
} from "@/lib/browser-preferences";
import { useDefaultAISettings } from "../hooks/use-default-ai-settings";
import { OllamaSettingsCard } from "./ollama-settings-card";

interface AISettingsPanelProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  onAISettingsChange: (settings: {
    provider: StoredAIProvider;
    apiKey: string;
    baseUrl?: string;
    model: string;
  }) => void;
}

export function AISettingsPanel({
  aiProvider,
  aiApiKey,
  onAISettingsChange,
}: AISettingsPanelProps) {
  const t = useTranslations("settings.apiKey");
  const common = useTranslations("common");

  const [state, setState] = useState({
    geminiKey: "",
    draftGeminiKey: "",
    showGeminiKey: false,
    geminiSaved: false,
    openaiKey: "",
    draftOpenaiKey: "",
    showOpenaiKey: false,
    openaiSaved: false,
  });
  const { defaultApiKeys, defaultBaseUrls } = useDefaultAISettings();

  const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));

  useEffect(() => {
    const storedGemini = getStoredAIApiKeyForProvider(AI_PROVIDER.GEMINI, defaultApiKeys);
    const storedOpenai = getStoredAIApiKeyForProvider(AI_PROVIDER.OPENAI, defaultApiKeys);
    
    setState((prev) => ({
      ...prev,
      geminiKey: storedGemini,
      draftGeminiKey: storedGemini,
      openaiKey: storedOpenai,
      draftOpenaiKey: storedOpenai,
    }));
  }, [aiProvider, aiApiKey, defaultApiKeys]);

  const handleGeminiSave = () => {
    saveStoredAIApiKeyForProvider(AI_PROVIDER.GEMINI, state.draftGeminiKey);
    updateState({ geminiKey: state.draftGeminiKey, geminiSaved: true });
    setTimeout(() => updateState({ geminiSaved: false }), 2200);

    onAISettingsChange({
      provider: aiProvider,
      apiKey: getStoredAIApiKeyForProvider(aiProvider, defaultApiKeys),
      baseUrl: getStoredAIBaseUrlForProvider(aiProvider, defaultBaseUrls),
      model: getStoredAIModel(),
    });
  };

  const handleGeminiDelete = () => {
    saveStoredAIApiKeyForProvider(AI_PROVIDER.GEMINI, "");
    const fallbackGeminiKey = getStoredAIApiKeyForProvider(AI_PROVIDER.GEMINI, defaultApiKeys);
    updateState({
      geminiKey: fallbackGeminiKey,
      draftGeminiKey: fallbackGeminiKey,
      geminiSaved: false,
    });

    onAISettingsChange({
      provider: aiProvider,
      apiKey: getStoredAIApiKeyForProvider(aiProvider, defaultApiKeys),
      baseUrl: getStoredAIBaseUrlForProvider(aiProvider, defaultBaseUrls),
      model: getStoredAIModel(),
    });
  };

  const handleOpenaiSave = () => {
    saveStoredAIApiKeyForProvider(AI_PROVIDER.OPENAI, state.draftOpenaiKey);
    updateState({ openaiKey: state.draftOpenaiKey, openaiSaved: true });
    setTimeout(() => updateState({ openaiSaved: false }), 2200);

    onAISettingsChange({
      provider: aiProvider,
      apiKey: getStoredAIApiKeyForProvider(aiProvider, defaultApiKeys),
      baseUrl: getStoredAIBaseUrlForProvider(aiProvider, defaultBaseUrls),
      model: getStoredAIModel(),
    });
  };

  const handleOpenaiDelete = () => {
    saveStoredAIApiKeyForProvider(AI_PROVIDER.OPENAI, "");
    const fallbackOpenaiKey = getStoredAIApiKeyForProvider(AI_PROVIDER.OPENAI, defaultApiKeys);
    updateState({
      openaiKey: fallbackOpenaiKey,
      draftOpenaiKey: fallbackOpenaiKey,
      openaiSaved: false,
    });

    onAISettingsChange({
      provider: aiProvider,
      apiKey: getStoredAIApiKeyForProvider(aiProvider, defaultApiKeys),
      baseUrl: getStoredAIBaseUrlForProvider(aiProvider, defaultBaseUrls),
      model: getStoredAIModel(),
    });
  };

  const getSummary = (key: string) => {
    if (!key) return common("states.notConfigured");
    if (key.length <= 12) return common("states.configured");
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  return (
    <BasicPanel className="p-6">

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-main">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          {t("title")}
        </h2>
      </div>

      <div className="space-y-6">
        <AlertBanner tone={ALERT_BANNER_TONES.WARNING} icon={AlertTriangle} title={t("warningTitle")}>
          {t("warningBody")}
        </AlertBanner>

        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
          <div className="rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 border-line bg-panel-elevated hover:bg-panel-active">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-text-muted" />
                  <h4 className="text-sm font-semibold text-text-main">
                    {t("geminiSectionTitle")}
                  </h4>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                  state.geminiKey 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-panel-control text-text-muted border-line"
                )}>
                  {getSummary(state.geminiKey)}
                </span>
              </div>
              <p className="text-xs text-text-muted mb-4 leading-relaxed">
                {t("placeholder")}
              </p>
              
              <div className="relative mb-4">
                <input
                  type={state.showGeminiKey ? "text" : "password"}
                  value={state.draftGeminiKey}
                  onChange={(e) => updateState({ draftGeminiKey: e.target.value })}
                  placeholder={t("placeholder")}
                  className="h-10 w-full rounded-xl border border-line bg-field px-3 pr-10 text-xs text-text-main outline-none transition-all placeholder:text-text-faint focus:border-ring/40 focus:ring-2 focus:ring-ring/10"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => updateState({ showGeminiKey: !state.showGeminiKey })}
                  className="absolute inset-y-0 right-2 flex w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-panel-hover hover:text-text-main"
                  title={state.showGeminiKey ? common("actions.hideKey") : common("actions.showKey")}
                >
                  {state.showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <IconTextButton
                icon={state.geminiSaved ? Check : Save}
                onClick={handleGeminiSave}
                disabled={!state.draftGeminiKey.trim()}
                tone={ICON_TEXT_BUTTON_TONES.PRIMARY_GRADIENT}
                strong
                className="h-9 text-xs py-0 px-3 flex-1"
              >
                {state.geminiSaved ? common("actions.saved") : common("actions.save")}
              </IconTextButton>
              <DeleteButton
                type="button"
                onClick={handleGeminiDelete}
                disabled={!state.geminiKey && !state.draftGeminiKey}
                strong
                className="h-9 text-xs py-0 px-3"
              >
                {common("actions.delete")}
              </DeleteButton>
            </div>
          </div>

          <div className="rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 border-line bg-panel-elevated hover:bg-panel-active">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4.5 w-4.5 text-text-muted" />
                  <h4 className="text-sm font-semibold text-text-main">
                    {t("openaiSectionTitle")}
                  </h4>
                </div>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                  state.openaiKey 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-panel-control text-text-muted border-line"
                )}>
                  {getSummary(state.openaiKey)}
                </span>
              </div>
              <p className="text-xs text-text-muted mb-4 leading-relaxed">
                {t("openaiPlaceholder")}
              </p>
              
              <div className="relative mb-4">
                <input
                  type={state.showOpenaiKey ? "text" : "password"}
                  value={state.draftOpenaiKey}
                  onChange={(e) => updateState({ draftOpenaiKey: e.target.value })}
                  placeholder={t("openaiPlaceholder")}
                  className="h-10 w-full rounded-xl border border-line bg-field px-3 pr-10 text-xs text-text-main outline-none transition-all placeholder:text-text-faint focus:border-ring/40 focus:ring-2 focus:ring-ring/10"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => updateState({ showOpenaiKey: !state.showOpenaiKey })}
                  className="absolute inset-y-0 right-2 flex w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-panel-hover hover:text-text-main"
                  title={state.showOpenaiKey ? common("actions.hideKey") : common("actions.showKey")}
                >
                  {state.showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <IconTextButton
                icon={state.openaiSaved ? Check : Save}
                onClick={handleOpenaiSave}
                disabled={!state.draftOpenaiKey.trim()}
                tone={ICON_TEXT_BUTTON_TONES.PRIMARY_GRADIENT}
                strong
                className="h-9 text-xs py-0 px-3 flex-1"
              >
                {state.openaiSaved ? common("actions.saved") : common("actions.save")}
              </IconTextButton>
              <DeleteButton
                type="button"
                onClick={handleOpenaiDelete}
                disabled={!state.openaiKey && !state.draftOpenaiKey}
                strong
                className="h-9 text-xs py-0 px-3"
              >
                {common("actions.delete")}
              </DeleteButton>
            </div>
          </div>

          <OllamaSettingsCard
            aiProvider={aiProvider}
            defaultApiKeys={defaultApiKeys}
            defaultBaseUrls={defaultBaseUrls}
            getSummary={getSummary}
            onAISettingsChange={onAISettingsChange}
          />
        </div>
      </div>
    </BasicPanel>
  );
}
