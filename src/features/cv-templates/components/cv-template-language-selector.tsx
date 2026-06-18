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
      <label className="mb-4 block text-sm font-medium text-text-soft">
        {t("outputLanguage")}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {(["es", "en"] as const).map((language) => (
          <button
            key={language}
            onClick={() => onLocaleChange(language)}
            className={`flex h-10 items-center justify-center rounded-xl border text-sm font-medium transition-all ${
              locale === language
                ? "border-template-language-border bg-template-language-soft text-template-language-text"
                : "border-line bg-panel-subtle text-text-muted hover:border-line-default hover:bg-panel-hover"
            }`}
          >
            {language === "es" ? t("spanish") : t("english")}
          </button>
        ))}
      </div>
    </div>
  );
}
