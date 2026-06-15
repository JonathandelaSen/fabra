import { ErrorCode } from "@/shared/error-codes";
import { DomainError } from "../errors/domain-error";

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
  throw new DomainError(ErrorCode.AI_PROVIDER_UNSUPPORTED, "Unsupported AI provider.");
}
