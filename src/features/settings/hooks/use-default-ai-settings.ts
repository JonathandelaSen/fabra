"use client";

import { useEffect, useState } from "react";
import type { StoredAIDefaultApiKeys } from "@/lib/browser-preferences";
import { fetchDefaultAISettings } from "../api/ai-settings-api";

export function useDefaultAISettings() {
  const [defaultApiKeys, setDefaultApiKeys] = useState<StoredAIDefaultApiKeys>({});

  useEffect(() => {
    let cancelled = false;

    fetchDefaultAISettings().then((settings) => {
      if (!cancelled) setDefaultApiKeys(settings.apiKeys);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { defaultApiKeys };
}
