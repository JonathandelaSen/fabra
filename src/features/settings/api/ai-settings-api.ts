import type { AIDefaultSettingsResponse } from "@/app/api/ai-settings/defaults/responses";

export async function fetchDefaultAISettings(): Promise<AIDefaultSettingsResponse> {
  const response = await fetch("/api/ai-settings/defaults");
  if (!response.ok) {
    return { apiKeys: {} };
  }
  return response.json();
}
