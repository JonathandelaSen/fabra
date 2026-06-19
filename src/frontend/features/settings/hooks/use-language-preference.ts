"use client";

import { useState } from "react";
import { useInterfaceLanguage } from "@/components/shared/i18n-provider";
import type { InterfaceLanguage } from "@/i18n/config";

export function useLanguagePreference() {
  const { locale, setInterfaceLanguage } = useInterfaceLanguage();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  const changeLanguage = async (nextLocale: InterfaceLanguage) => {
    setSaved(false);
    setError(false);
    try {
      await setInterfaceLanguage(nextLocale);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch {
      setError(true);
    }
  };

  return {
    locale,
    saved,
    error,
    changeLanguage,
  };
}
