"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface CVEditorSettingsSectionProps {
  locale: string;
  savingLocale: boolean;
  onUpdateLocale: (locale: "es" | "en") => void;
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
    <section className="pt-4 border-t border-white/5 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600">
        {t("settings.title")}
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {t("settings.cvLanguage")}
          </span>
          <div className="flex gap-1 rounded-lg border border-white/5 p-1 bg-white/5">
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => onUpdateLocale(l)}
                disabled={savingLocale}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                  locale === l
                    ? "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{t("settings.design")}</span>
          <Button
            variant="link"
            onClick={onOpenTemplates}
            className="h-auto p-0 text-xs text-teal-400"
          >
            {t("settings.changeTemplate")}
          </Button>
        </div>
      </div>
    </section>
  );
}
