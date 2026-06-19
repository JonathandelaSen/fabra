import type { EventBus } from "../../domain/bus/event-bus/event-bus";
import {
  AIInteractionAppliedEvent,
  AIInteractionFailedEvent,
  AIInteractionPreparedEvent,
  AIInteractionRequestSentEvent,
  AIInteractionResponseReceivedEvent,
  AIInteractionResponseValidatedEvent,
} from "../../domain/ai-runtime/ai-runtime.events";
import {
  AIAssistanceMode,
  AIInteractionFailureStage,
  type AIInteractionContext,
} from "../../domain/ai-runtime/ai-runtime.types";
import { InvalidApiKeyError } from "../../domain/errors/invalid-api-key.error";

export function createIntegratedAIInteractionContext(
  input: Omit<
    AIInteractionContext,
    "interactionId" | "attemptId" | "assistanceMode"
  >,
): AIInteractionContext {
  return {
    ...input,
    interactionId: crypto.randomUUID(),
    attemptId: crypto.randomUUID(),
    assistanceMode: AIAssistanceMode.Integrated,
  };
}

export function serializeAIInteractionPrompt(input: unknown): string {
  return JSON.stringify(input, null, 2);
}

function isInvalidApiKeyError(error: unknown): boolean {
  if (!error) return false;

  if (
    typeof error === "object" &&
    error !== null &&
    ("status" in error || "code" in error || "message" in error)
  ) {
    const status = (error as any).status;
    const code = (error as any).code;
    const message = (error as any).message;

    if (status === 401 || code === "invalid_api_key") {
      return true;
    }

    if (typeof message === "string") {
      const msgLower = message.toLowerCase();
      if (
        msgLower.includes("api key not valid") ||
        msgLower.includes("api_key_invalid") ||
        msgLower.includes("incorrect api key") ||
        msgLower.includes("invalid api key") ||
        msgLower.includes("invalid_api_key") ||
        msgLower.includes("key_invalid")
      ) {
        return true;
      }
    }
  }

  return false;
}

export async function runTrackedAIInteraction<TResult>(input: {
  eventBus: EventBus;
  context: AIInteractionContext;
  prompt: string;
  promptVersion?: string;
  execute: () => Promise<TResult>;
}): Promise<TResult> {
  await input.eventBus.publish([
    new AIInteractionPreparedEvent({
      context: input.context,
      prompt: input.prompt,
      promptVersion: input.promptVersion ?? "1",
    }),
    new AIInteractionRequestSentEvent({ context: input.context }),
  ]);

  const startedAt = Date.now();
  try {
    const result = await input.execute();
    await input.eventBus.publish([
      new AIInteractionResponseReceivedEvent({
        context: input.context,
        rawResponse: JSON.stringify(result),
        durationMs: Date.now() - startedAt,
      }),
      new AIInteractionResponseValidatedEvent({
        context: input.context,
        parsedResult: result,
      }),
    ]);
    return result;
  } catch (error) {
    const mappedError = isInvalidApiKeyError(error)
      ? new InvalidApiKeyError(
          error instanceof Error
            ? error.message
            : typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string"
            ? (error as any).message
            : undefined
        )
      : error;

    await input.eventBus.publish([
      new AIInteractionFailedEvent({
        context: input.context,
        stage: AIInteractionFailureStage.Request,
        errorName: mappedError instanceof Error ? mappedError.name : "UnknownError",
        errorMessage: mappedError instanceof Error ? mappedError.message : String(mappedError),
        durationMs: Date.now() - startedAt,
      }),
    ]);
    throw mappedError;
  }
}

export async function publishAIInteractionApplied(
  eventBus: EventBus,
  context: AIInteractionContext,
 ): Promise<void> {
  await eventBus.publish([new AIInteractionAppliedEvent({ context })]);
}

