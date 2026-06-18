"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useThemePreference } from "@/features/settings";

export function PublicCVThemeToggle() {
  const t = useTranslations("settings.theme");
  const { theme, changeTheme } = useThemePreference();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-line-default bg-panel/70 dark:border-line-default dark:bg-panel-elevated/70" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => changeTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line-default bg-panel/70 text-text-faint transition-all hover:border-line-strong hover:bg-panel hover:text-text-main hover:shadow-sm dark:border-line-default dark:bg-panel-elevated/70 dark:text-text-soft dark:hover:border-line-strong dark:hover:bg-panel-elevated dark:hover:text-text-on-bright"
      aria-label={t("label")}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

