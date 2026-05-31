import { AI_PROVIDER } from "@/modules/shared/domain/value-objects/ai-provider.value-object";

export type AIDefaultApiKeysResponse = Partial<
  Record<typeof AI_PROVIDER.GEMINI | typeof AI_PROVIDER.OPENAI | typeof AI_PROVIDER.OLLAMA, string>
>;

export type AIDefaultBaseUrlsResponse = Partial<
  Record<typeof AI_PROVIDER.GEMINI | typeof AI_PROVIDER.OPENAI | typeof AI_PROVIDER.OLLAMA, string>
>;

export interface AIDefaultSettingsResponse {
  apiKeys: AIDefaultApiKeysResponse;
  baseUrls: AIDefaultBaseUrlsResponse;
}

export function toAIDefaultSettingsResponse(): AIDefaultSettingsResponse {
  return {
    apiKeys: {
      [AI_PROVIDER.GEMINI]: process.env.GEMINI_API_KEY?.trim() || undefined,
      [AI_PROVIDER.OPENAI]: process.env.OPENAI_API_KEY?.trim() || undefined,
    },
    baseUrls: {
      [AI_PROVIDER.OLLAMA]: process.env.OLLAMA_BASE_URL?.trim() || undefined,
    },
  };
}
