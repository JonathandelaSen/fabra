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
  type StoredAIDefaultApiKeys,
  type StoredAIDefaultBaseUrls,
  type StoredAIProvider,
} from "@/lib/browser-preferences";

interface OllamaSettingsCardProps {
  aiProvider: StoredAIProvider;
  defaultApiKeys: StoredAIDefaultApiKeys;
  defaultBaseUrls: StoredAIDefaultBaseUrls;
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
  defaultApiKeys,
  defaultBaseUrls,
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
    const storedUrl = getStoredAIBaseUrlForProvider("ollama", defaultBaseUrls);
    const storedModel = getStoredAIModelForProvider("ollama");
    setState((prev) => ({
      ...prev,
      url: storedUrl,
      draftUrl: urlDirtyRef.current ? prev.draftUrl : storedUrl,
      model: storedModel,
      draftModel: modelDirtyRef.current ? prev.draftModel : storedModel,
    }));
  }, [aiProvider, defaultBaseUrls]);

  const updateState = (updates: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    const draftUrl = urlInputRef.current?.value ?? state.draftUrl;
    const draftModel = modelInputRef.current?.value ?? state.draftModel;

    saveStoredAIBaseUrlForProvider("ollama", draftUrl);
    saveStoredAIModelForProvider("ollama", draftModel);
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
      apiKey: getStoredAIApiKeyForProvider(aiProvider, defaultApiKeys),
      baseUrl: getStoredAIBaseUrlForProvider(aiProvider, defaultBaseUrls),
      model: aiProvider === "ollama" ? draftModel : getStoredAIModel(),
    });
  };

  const handleDelete = () => {
    saveStoredAIBaseUrlForProvider("ollama", "");
    saveStoredAIModelForProvider("ollama", "");
    urlDirtyRef.current = false;
    modelDirtyRef.current = false;
    const fallbackUrl = getStoredAIBaseUrlForProvider("ollama", defaultBaseUrls);
    updateState({
      url: fallbackUrl,
      draftUrl: fallbackUrl,
      model: "",
      draftModel: "",
      saved: false,
    });

    onAISettingsChange({
      provider: aiProvider,
      apiKey: getStoredAIApiKeyForProvider(aiProvider, defaultApiKeys),
      baseUrl: getStoredAIBaseUrlForProvider(aiProvider, defaultBaseUrls),
      model: getStoredAIModel(),
    });
  };

  return (
    <div className="rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 border-white/[0.06] bg-[#07070d]/50 hover:bg-[#07070d]/80">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-zinc-500" />
            <h4 className="text-sm font-semibold text-zinc-200">
              {t("ollamaSectionTitle")}
            </h4>
          </div>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium border",
            state.url
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-zinc-800 text-zinc-500 border-white/[0.04]",
          )}>
            {getSummary(state.url)}
          </span>
        </div>
        <div className="relative mb-3">
          <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
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
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 text-xs text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="relative mb-4">
          <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
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
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 text-xs text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
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
