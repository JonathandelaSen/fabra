export type AIDefaultApiKeysResponse = Partial<
  Record<"gemini" | "openai", string>
>;

export interface AIDefaultSettingsResponse {
  apiKeys: AIDefaultApiKeysResponse;
}

export function toAIDefaultSettingsResponse(): AIDefaultSettingsResponse {
  return {
    apiKeys: {
      gemini: process.env.GEMINI_API_KEY?.trim() || undefined,
      openai: process.env.OPENAI_API_KEY?.trim() || undefined,
    },
  };
}
