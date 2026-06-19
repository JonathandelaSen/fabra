import { ErrorCode } from "@/shared/error-codes";
import { AI_PROVIDER, AI_PROVIDERS } from "@/shared/ai-provider";
import { DomainError } from "../errors/domain-error";
import { ValueObject } from "./value-object";

export { AI_PROVIDER, AI_PROVIDERS };

export type AIProvider = (typeof AI_PROVIDERS)[number];

export function isAIProvider(value: unknown): value is AIProvider {
  return typeof value === "string" && AI_PROVIDERS.includes(value as AIProvider);
}

export function parseAIProvider(value: unknown): AIProvider {
  if (isAIProvider(value)) return value;
  throw new DomainError(ErrorCode.AI_PROVIDER_UNSUPPORTED, "Unsupported AI provider.");
}

export class AIProviderValue extends ValueObject<AIProvider> {
  private constructor(private readonly value: AIProvider) {
    super();
  }

  static fromPrimitives(value: unknown): AIProviderValue {
    return new AIProviderValue(parseAIProvider(value));
  }

  toPrimitives(): AIProvider {
    return this.value;
  }
}
