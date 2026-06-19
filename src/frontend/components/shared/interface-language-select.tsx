"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import type { InterfaceLanguage } from "@/i18n/config";

export function InterfaceLanguageSelect({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("settings.language");
  const { locale, setInterfaceLanguage } = useInterfaceLanguage();
  const [pending, setPending] = useState(false);

  async function handleChange(nextLocale: InterfaceLanguage) {
    setPending(true);
    try {
      await setInterfaceLanguage(nextLocale);
    } finally {
      setPending(false);
    }
  }

  return (
    <label className={`flex items-center gap-2 ${compact ? "text-xs" : "text-sm"} text-text-muted`}>
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(event) => void handleChange(event.target.value as InterfaceLanguage)}
        className="rounded-lg border border-line-default bg-panel-hover px-2 py-1.5 text-text-soft outline-none transition-colors focus:border-action-border focus:ring-2 focus:ring-action-soft disabled:opacity-60"
      >
        <option value="en">{t("options.en")}</option>
        <option value="es">{t("options.es")}</option>
      </select>
    </label>
  );
}
