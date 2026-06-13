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
      <div className="h-9 w-9 rounded-xl border border-zinc-300 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/70" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => changeTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 bg-white/70 text-zinc-700 transition-all hover:border-zinc-400 hover:bg-white hover:text-zinc-950 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
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

