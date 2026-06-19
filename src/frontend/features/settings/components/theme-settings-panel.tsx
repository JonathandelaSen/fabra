"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { SettingsSectionPanel } from "@/components/shared/settings-section-panel";
import type { StoredThemePreference } from "@/lib/browser-preferences";
import { useThemePreference } from "../hooks/use-theme-preference";

const themeOptions: Array<{
  value: StoredThemePreference;
  icon: typeof Sun;
}> = [
  { value: "dark", icon: Moon },
  { value: "light", icon: Sun },
];

export function ThemeSettingsPanel() {
  const t = useTranslations("settings.theme");
  const { theme, changeTheme } = useThemePreference();

  return (
    <SettingsSectionPanel title={t("title")} icon={Sun} description={t("description")}>
      <div
        className="grid w-full max-w-md grid-cols-2 gap-2 rounded-xl border border-line-default bg-panel-control p-1"
        role="radiogroup"
        aria-label={t("label")}
      >
        {themeOptions.map(({ value, icon: Icon }) => {
          const selected = theme === value;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => changeTheme(value)}
              className={`flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                selected
                  ? "bg-action text-text-on-dark shadow-sm"
                  : "text-text-soft hover:bg-panel-hover hover:text-text-on-bright"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(`options.${value}`)}
            </button>
          );
        })}
      </div>
    </SettingsSectionPanel>
  );
}
