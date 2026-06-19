export const AI_PROVIDER = {
  GEMINI: "gemini",
  OPENAI: "openai",
  MOCK: "mock",
  OLLAMA: "ollama",
} as const;

export const AI_PROVIDERS = [AI_PROVIDER.GEMINI, AI_PROVIDER.OPENAI, AI_PROVIDER.MOCK, AI_PROVIDER.OLLAMA] as const;
