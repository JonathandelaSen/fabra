"use client";

import { useEffect, useState } from "react";
import {
  applyStoredThemePreference,
  getStoredThemePreference,
  saveStoredThemePreference,
  type StoredThemePreference,
} from "@/frontend/utils/browser-preferences";

export function useThemePreference() {
  const [theme, setTheme] = useState<StoredThemePreference>("dark");

  useEffect(() => {
    const storedTheme = getStoredThemePreference();
    setTheme(storedTheme);
    applyStoredThemePreference(storedTheme);

    const syncTheme = () => {
      setTheme(getStoredThemePreference());
    };

    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const changeTheme = (nextTheme: StoredThemePreference) => {
    setTheme(saveStoredThemePreference(nextTheme));
  };

  return {
    theme,
    changeTheme,
  };
}
