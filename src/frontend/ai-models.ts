export const GEMINI_MODELS = {
  "gemini-2.5-flash-lite": "Gemini 2.5 Flash Lite",
  "gemini-3.1-flash-lite": "Gemini 3.1 Flash Lite",
  "gemini-3.5-flash": "Gemini 3.5 Flash",
} as const;

export type GeminiModelId = keyof typeof GEMINI_MODELS;

export const DEFAULT_GEMINI_MODEL: GeminiModelId = "gemini-3.5-flash";
export const CHEAPEST_GEMINI_MODEL: GeminiModelId = "gemini-2.5-flash-lite";
export const FAST_GEMINI_MODEL: GeminiModelId[] = ["gemini-3.1-flash-lite"];
export const POWERFUL_GEMINI_MODEL: GeminiModelId[] = [DEFAULT_GEMINI_MODEL];

export const OPENAI_MODELS = {
  "gpt-5-nano": "GPT-5 Nano",
  "gpt-5.4-nano": "GPT-5.4 Nano",
  "gpt-5.4": "GPT-5.4",
} as const;

export type OpenAIModelId = keyof typeof OPENAI_MODELS;

export const DEFAULT_OPENAI_MODEL: OpenAIModelId = "gpt-5.4";
export const CHEAPEST_OPENAI_MODEL: OpenAIModelId = "gpt-5-nano";
export const FAST_OPENAI_MODEL: OpenAIModelId[] = ["gpt-5.4-nano"];
export const POWERFUL_OPENAI_MODEL: OpenAIModelId[] = [DEFAULT_OPENAI_MODEL];
