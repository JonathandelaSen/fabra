"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Save,
  ShieldCheck,
} from "lucide-react";
import { AlertBanner, ALERT_BANNER_TONES } from "@/components/shared/alert-banner";
import {
  DeleteButton,
  IconTextButton,
  ICON_TEXT_BUTTON_TONES,
} from "@/components/shared/action-buttons";
import type { StoredAIProvider } from "@/lib/browser-preferences";
import { DEFAULT_GEMINI_MODEL } from "@/frontend/ai-models";
import { useAISettingsDraft } from "../hooks/use-ai-settings-draft";
import { BasicPanel } from "@/components/shared/basic-panel";

interface AISettingsPanelProps {
  aiProvider: StoredAIProvider;
  aiApiKey: string;
  aiModel: string;
  onAISettingsChange: (settings: {
    provider: StoredAIProvider;
    apiKey: string;
    model: string;
  }) => void;
}

export function AISettingsPanel({
  aiProvider,
  aiApiKey,
  aiModel,
  onAISettingsChange,
}: AISettingsPanelProps) {
  const t = useTranslations("settings.apiKey");
  const common = useTranslations("common");
  const {
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
  } = useAISettingsDraft({
    aiProvider,
    aiApiKey,
    aiModel,
    onAISettingsChange,
    notConfiguredLabel: common("states.notConfigured"),
    configuredLabel: common("states.configured"),
  });

  return (
    <BasicPanel className="p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          {t("title")}
        </h2>
        <div className="w-fit rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-left sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            {t("status")}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-200">
            {keySummary}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <AlertBanner tone={ALERT_BANNER_TONES.WARNING} icon={AlertTriangle} title={t("warningTitle")}>
          {t("warningBody")}
        </AlertBanner>

        <div className="rounded-xl border border-white/[0.06] bg-[#0a0a12] p-4">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-200">
            <KeyRound className="h-4 w-4 text-indigo-300" />
            {t("fieldLabel")}
          </p>
          <div className="mb-3 grid gap-3 sm:grid-cols-[180px_1fr]">
            <select
              value={draftProvider}
              onChange={(event) =>
                setDraftProvider(event.target.value as StoredAIProvider)
              }
              className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-zinc-200 outline-none transition-all focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
            >
              <option value="gemini">Gemini</option>
              {process.env.NODE_ENV !== "production" && (
                <option value="mock">Mock</option>
              )}
            </select>
            <input
              value={draftModel}
              onChange={(event) => setDraftModel(event.target.value)}
              placeholder={DEFAULT_GEMINI_MODEL}
              className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={inputValue}
                onChange={(event) => {
                  setDraftValue(event.target.value);
                }}
                placeholder={t("placeholder")}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 pr-12 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((value) => !value)}
                className="absolute inset-y-0 right-2 flex w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
                title={
                  showKey
                    ? common("actions.hideKey")
                    : common("actions.showKey")
                }
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <IconTextButton
              icon={saved ? Check : Save}
              onClick={save}
              disabled={draftProvider !== "mock" && !inputValue.trim()}
              tone={ICON_TEXT_BUTTON_TONES.PRIMARY_GRADIENT}
              strong
              className="h-11"
            >
              {saved ? common("actions.saved") : common("actions.save")}
            </IconTextButton>
            <DeleteButton
              type="button"
              onClick={remove}
              disabled={!aiApiKey && !inputValue}
              strong
              className="h-11"
            >
              {common("actions.delete")}
            </DeleteButton>
          </div>
        </div>
      </div>
    </BasicPanel>
  );
}
