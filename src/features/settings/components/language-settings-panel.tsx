"use client";

import { useTranslations } from "next-intl";
import { Globe2 } from "lucide-react";
import { SettingsSectionPanel } from "@/components/shared/settings-section-panel";
import type { InterfaceLanguage } from "@/i18n/config";
import { useLanguagePreference } from "../hooks/use-language-preference";

export function LanguageSettingsPanel() {
  const t = useTranslations("settings.language");
  const { locale, saved, error, changeLanguage } = useLanguagePreference();

  return (
    <SettingsSectionPanel title={t("title")} icon={Globe2} description={t("description")}>
      <label
        className="block text-sm font-medium text-zinc-300"
        htmlFor="interface-language"
      >
        {t("label")}
      </label>
      <select
        id="interface-language"
        value={locale}
        onChange={(event) =>
          void changeLanguage(event.target.value as InterfaceLanguage)
        }
        className="mt-2 h-11 w-full max-w-xs rounded-xl border border-white/[0.08] bg-[#0a0a12] px-4 text-sm text-zinc-200 outline-none transition-all focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10"
      >
        <option value="en">{t("options.en")}</option>
        <option value="es">{t("options.es")}</option>
      </select>
      {(saved || error) && (
        <p className={`mt-3 text-sm ${error ? "text-rose-300" : "text-emerald-300"}`}>
          {error ? t("error") : t("saved")}
        </p>
      )}
    </SettingsSectionPanel>
  );
}
