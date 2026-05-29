"use client";

import { useTranslations } from "next-intl";
import type { CVTemplateLocale } from "@/lib/cv-templates";

interface CVTemplateLanguageSelectorProps {
  locale: CVTemplateLocale;
  onLocaleChange: (locale: CVTemplateLocale) => void;
}

export function CVTemplateLanguageSelector({
  locale,
  onLocaleChange,
}: CVTemplateLanguageSelectorProps) {
  const t = useTranslations("analysisFlow.templates");

  return (
    <div>
      <label className="mb-4 block text-sm font-medium text-zinc-300">
        {t("outputLanguage")}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {(["es", "en"] as const).map((language) => (
          <button
            key={language}
            onClick={() => onLocaleChange(language)}
            className={`flex h-10 items-center justify-center rounded-xl border text-sm font-medium transition-all ${
              locale === language
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                : "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            {language === "es" ? t("spanish") : t("english")}
          </button>
        ))}
      </div>
    </div>
  );
}
