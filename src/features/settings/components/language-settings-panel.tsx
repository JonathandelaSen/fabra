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
        className="block text-sm font-medium text-text-soft"
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
        className="mt-2 h-11 w-full max-w-xs rounded-xl border border-line bg-field px-4 text-sm text-text-main outline-none transition-all focus:border-ring/40 focus:ring-2 focus:ring-ring/10"
      >
        <option value="en">{t("options.en")}</option>
        <option value="es">{t("options.es")}</option>
      </select>
      {(saved || error) && (
        <p className={`mt-3 text-sm ${error ? "text-danger-text" : "text-success-text"}`}>
          {error ? t("error") : t("saved")}
        </p>
      )}
    </SettingsSectionPanel>
  );
}
