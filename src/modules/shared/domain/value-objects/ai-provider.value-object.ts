import { badRequest } from "../../infrastructure/http/api-errors";

export const AI_PROVIDER = {
  GEMINI: "gemini",
  OPENAI: "openai",
  MOCK: "mock",
  OLLAMA: "ollama",
} as const;

export const AI_PROVIDERS = [AI_PROVIDER.GEMINI, AI_PROVIDER.OPENAI, AI_PROVIDER.MOCK, AI_PROVIDER.OLLAMA] as const;

export type AIProvider = (typeof AI_PROVIDERS)[number];

export function isAIProvider(value: unknown): value is AIProvider {
  return typeof value === "string" && AI_PROVIDERS.includes(value as AIProvider);
}

export function parseAIProvider(value: unknown): AIProvider {
  if (isAIProvider(value)) return value;
  throw badRequest("Unsupported AI provider.");
}
