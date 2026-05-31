"use client";

import { useEffect, useState } from "react";
import type { StoredAIDefaultApiKeys, StoredAIDefaultBaseUrls } from "@/lib/browser-preferences";

export interface AIDefaultSettingsResponse {
  apiKeys: StoredAIDefaultApiKeys;
  baseUrls: StoredAIDefaultBaseUrls;
}

export async function fetchDefaultAISettings(): Promise<AIDefaultSettingsResponse> {
  const response = await fetch("/api/ai-settings/defaults");
  if (!response.ok) {
    return { apiKeys: {}, baseUrls: {} };
  }
  return response.json();
}

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
