export const GEMINI_MODELS = {
  "gemini-2.5-flash": "Gemini 2.5 Flash",
  "gemini-2.5-pro": "Gemini 2.5 Pro",
  "gemini-3.1-flash-preview": "Gemini 3.1 Flash Preview",
  "gemini-3.1-pro-preview": "Gemini 3.1 Pro Preview",
} as const;

export type GeminiModelId = keyof typeof GEMINI_MODELS;

export const DEFAULT_GEMINI_MODEL: GeminiModelId = "gemini-3.1-pro-preview";
export const DEFAULT_FAST_GEMINI_MODEL: GeminiModelId = "gemini-2.5-flash";
