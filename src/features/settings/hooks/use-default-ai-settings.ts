"use client";

import { useEffect, useState } from "react";
import type { StoredAIDefaultApiKeys, StoredAIDefaultBaseUrls } from "@/lib/browser-preferences";
import { fetchDefaultAISettings } from "../api/ai-settings-api";

export function useDefaultAISettings() {
  const [defaultApiKeys, setDefaultApiKeys] = useState<StoredAIDefaultApiKeys>({});
  const [defaultBaseUrls, setDefaultBaseUrls] = useState<StoredAIDefaultBaseUrls>({});

  useEffect(() => {
    let cancelled = false;

    fetchDefaultAISettings().then((settings) => {
      if (!cancelled) {
        setDefaultApiKeys(settings.apiKeys);
        setDefaultBaseUrls(settings.baseUrls || {});
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { defaultApiKeys, defaultBaseUrls };
}
