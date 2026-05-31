export type AIDefaultApiKeysResponse = Partial<
  Record<"gemini" | "openai" | "ollama", string>
>;

export type AIDefaultBaseUrlsResponse = Partial<
  Record<"gemini" | "openai" | "ollama", string>
>;

export interface AIDefaultSettingsResponse {
  apiKeys: AIDefaultApiKeysResponse;
  baseUrls: AIDefaultBaseUrlsResponse;
}

export function toAIDefaultSettingsResponse(): AIDefaultSettingsResponse {
  return {
    apiKeys: {
      gemini: process.env.GEMINI_API_KEY?.trim() || undefined,
      openai: process.env.OPENAI_API_KEY?.trim() || undefined,
    },
    baseUrls: {
      ollama: process.env.OLLAMA_BASE_URL?.trim() || undefined,
    },
  };
}
