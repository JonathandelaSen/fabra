"use client";

import { useTranslations } from "next-intl";
import { LayoutTemplate } from "lucide-react";
import { IconTextButton } from "@/components/shared/action-buttons";

import type { CVTemplateLocale } from "@/lib/cv-templates";

interface CVEditorSettingsSectionProps {
  locale: string;
  savingLocale: boolean;
  onUpdateLocale: (locale: CVTemplateLocale) => void;
  onOpenTemplates: () => void;
}

export function CVEditorSettingsSection({
  locale,
  savingLocale,
  onUpdateLocale,
  onOpenTemplates,
}: CVEditorSettingsSectionProps) {
  const t = useTranslations("cvEditor");

  return (
    <section className="pt-4 border-t border-line space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-text-faint">
        {t("settings.title")}
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {t("settings.cvLanguage")}
          </span>
          <div className="flex gap-1 rounded-lg border border-line p-1 bg-panel-hover">
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => onUpdateLocale(l)}
                disabled={savingLocale}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                  locale === l
                    ? "bg-panel-active text-text-main"
                    : "text-text-muted hover:text-text-soft"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">{t("settings.design")}</span>
          <IconTextButton
            icon={LayoutTemplate}
            onClick={onOpenTemplates}
          >
            {t("settings.changeTemplate")}
          </IconTextButton>
        </div>
      </div>
    </section>
  );
}
