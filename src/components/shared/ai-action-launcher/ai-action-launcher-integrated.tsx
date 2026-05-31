"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, ChevronDown, Check, KeyRound, Sparkles, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { AlertBanner, ALERT_BANNER_TONES } from "../alert-banner";
import {
  getAIRequestConfigForProvider,
  getStoredAIModelForProvider,
  saveStoredAIProvider,
  type StoredAIProvider,
} from "@/lib/browser-preferences";
import {
  GEMINI_MODELS,
  OPENAI_MODELS,
  DEFAULT_GEMINI_MODEL,
  CHEAPEST_GEMINI_MODEL,
  CHEAPEST_OPENAI_MODEL,
  FAST_GEMINI_MODEL,
  FAST_OPENAI_MODEL,
  POWERFUL_GEMINI_MODEL,
  POWERFUL_OPENAI_MODEL,
} from "@/frontend/ai-models";

interface AIActionLauncherIntegratedProps {
  available: boolean;
  selectedProvider: StoredAIProvider;
  onProviderChange: (provider: StoredAIProvider) => void;
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  onRun: () => void;
  unavailableReason?: string;
  onConfigure?: () => void;
  onClose: () => void;
}

// PROVIDERS will be built dynamically inside the component to use translations

export default function AIActionLauncherIntegrated({
  available,
  selectedProvider,
  onProviderChange,
  selectedModelId,
  onModelChange,
  onRun,
  unavailableReason,
  onConfigure,
  onClose,
}: AIActionLauncherIntegratedProps) {
  const t = useTranslations("aiLauncher");
  const formsT = useTranslations("analysisFlow.forms");
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [configurationError, setConfigurationError] = useState<string | null>(null);
  const commonT = useTranslations("common.providers");

  const PROVIDERS = [
    { id: "gemini", label: commonT("gemini") },
    { id: "openai", label: commonT("openai") },
    { id: "ollama", label: "Ollama (Local)" },
    ...(process.env.NODE_ENV !== "production" ? [{ id: "mock", label: commonT("mock") }] : []),
  ] as const;

  const aiConfig = getAIRequestConfigForProvider(selectedProvider, "", selectedModelId);
  const currentConfigurationError = aiConfig.error;

  const handleIntegratedRun = () => {
    if (currentConfigurationError) {
      setConfigurationError(currentConfigurationError);
      return;
    }
    onClose();
    onRun();
  };

  const selectedProviderLabel = PROVIDERS.find((p) => p.id === selectedProvider)?.label || "Provider";

  const getGeminiModelBadge = (modelId: string) => {
    if (modelId === CHEAPEST_GEMINI_MODEL) return formsT("cheapest");
    if (FAST_GEMINI_MODEL.includes(modelId as keyof typeof GEMINI_MODELS)) return formsT("fast");
    if (POWERFUL_GEMINI_MODEL.includes(modelId as keyof typeof GEMINI_MODELS)) return formsT("powerful");
    return undefined;
  };

  const getOpenAIModelBadge = (modelId: string) => {
    if (modelId === CHEAPEST_OPENAI_MODEL) return formsT("cheapest");
    if (FAST_OPENAI_MODEL.includes(modelId as keyof typeof OPENAI_MODELS)) return formsT("fast");
    if (POWERFUL_OPENAI_MODEL.includes(modelId as keyof typeof OPENAI_MODELS)) return formsT("powerful");
    return undefined;
  };

  const configuredOllamaModel = getStoredAIModelForProvider("ollama");

  let availableModels: { id: string; label: string; badge?: string }[] = [];
  
  if (selectedProvider === "gemini") {
    availableModels = Object.entries(GEMINI_MODELS).map(([id, label]) => ({
      id,
      label,
      badge: getGeminiModelBadge(id),
    }));
  } else if (selectedProvider === "openai") {
    availableModels = Object.entries(OPENAI_MODELS).map(([id, label]) => ({
      id,
      label,
      badge: getOpenAIModelBadge(id),
    }));
  } else if (selectedProvider === "ollama") {
    availableModels = [
      { id: configuredOllamaModel, label: configuredOllamaModel || "Model not configured", badge: "Local Configured" }
    ];
  } else if (selectedProvider === "mock") {
    availableModels = [
      { id: "mock-model", label: commonT("mockModel"), badge: "Dev" },
    ];
  }

  const selectedModel = availableModels.find((m) => m.id === selectedModelId) || availableModels[0];

  const isRunnable = available || selectedProvider === "ollama" || selectedProvider === "mock";

  return (
    <div
      className="relative p-4 rounded-xl border transition-all duration-300 bg-panel-subtle flex flex-col gap-3 border-line hover:border-violet-500/30 hover:bg-panel-hover"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/10">
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-text-main">
            {t("insideLabel")}
          </h4>
          <p className="text-[11px] sm:text-xs text-text-muted mt-0.5 leading-relaxed">
            {t("insideDesc")}
          </p>
        </div>
      </div>

        <div className="flex flex-col gap-2 relative">
          {/* Provider Selection */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProviderDropdown(!showProviderDropdown);
                setShowModelDropdown(false);
              }}
              className="w-full h-9 px-3 rounded-lg bg-field border border-line hover:border-line-default text-xs text-text-soft flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-text-muted" />
                <span className="font-medium">{selectedProviderLabel}</span>
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-text-muted transition-transform duration-300",
                  showProviderDropdown && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {showProviderDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-[60] w-full mt-1.5 rounded-lg border border-line bg-panel-overlay shadow-xl overflow-hidden"
                >
                  <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    {PROVIDERS.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => {
                          const nextProvider = provider.id as StoredAIProvider;
                          saveStoredAIProvider(nextProvider);
                          onProviderChange(nextProvider);
                          setConfigurationError(null);
                          setShowProviderDropdown(false);
                          
                          // Reset model to default of the new provider
                          if (nextProvider === "gemini") {
                            onModelChange(DEFAULT_GEMINI_MODEL);
                          } else if (nextProvider === "openai") {
                            onModelChange(CHEAPEST_OPENAI_MODEL);
                          } else if (nextProvider === "ollama") {
                            onModelChange(getStoredAIModelForProvider("ollama"));
                          } else {
                            onModelChange("mock-model");
                          }
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-all cursor-pointer",
                          provider.id === selectedProvider
                            ? "bg-violet-500/10 text-violet-300 font-semibold"
                            : "text-text-muted hover:bg-panel-hover hover:text-text-main"
                        )}
                      >
                        <span>{provider.label}</span>
                        {provider.id === selectedProvider && (
                          <Check className="w-3.5 h-3.5 text-violet-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Model Selection */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowModelDropdown(!showModelDropdown);
                setShowProviderDropdown(false);
              }}
              className="w-full h-9 px-3 rounded-lg bg-field border border-line hover:border-line-default text-xs text-text-soft flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-text-muted" />
                <span className="font-medium">
                  {selectedModel?.label || "Select model"}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                {selectedModel?.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-panel-control text-text-muted border border-line">
                    {selectedModel.badge}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-text-muted transition-transform duration-300",
                    showModelDropdown && "rotate-180"
                  )}
                />
              </span>
            </button>

            <AnimatePresence>
              {showModelDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-[50] w-full mt-1.5 rounded-lg border border-line bg-panel-overlay shadow-xl overflow-hidden"
                >
                  <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    {availableModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          onModelChange(model.id);
                          setConfigurationError(null);
                          setShowModelDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-all cursor-pointer",
                          model.id === selectedModelId
                            ? "bg-violet-500/10 text-violet-300 font-semibold"
                            : "text-text-muted hover:bg-panel-hover hover:text-text-main"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span>{model.label}</span>
                          {model.badge && (
                            <span className="text-[8px] scale-90 px-1 py-0.2 bg-panel-control text-text-muted border border-line rounded">
                              {model.badge}
                            </span>
                          )}
                        </span>
                        {model.id === selectedModelId && (
                          <Check className="w-3.5 h-3.5 text-violet-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isRunnable ? (
            <button
              type="button"
              onClick={handleIntegratedRun}
              className="w-full mt-1 py-2 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-md shadow-violet-950/20 cursor-pointer"
            >
              {t("continue")}
            </button>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              <AlertBanner tone={ALERT_BANNER_TONES.WARNING} icon={KeyRound}>
                {t("configureAI")}
              </AlertBanner>
              {onConfigure && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onConfigure?.();
                  }}
                  className="w-full py-2 px-4 rounded-lg border border-amber-500/30 hover:bg-amber-500/15 text-amber-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  {t("configureAI")}
                </button>
              )}
            </div>
          )}
          {(configurationError || currentConfigurationError) && (
            <AlertBanner tone={ALERT_BANNER_TONES.WARNING} icon={KeyRound}>
              {configurationError || currentConfigurationError}
            </AlertBanner>
          )}
        </div>
    </div>
  );
}
