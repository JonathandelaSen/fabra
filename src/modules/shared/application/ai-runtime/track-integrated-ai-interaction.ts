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
    await input.eventBus.publish([
      new AIInteractionFailedEvent({
        context: input.context,
        stage: AIInteractionFailureStage.Request,
        errorName: error instanceof Error ? error.name : "UnknownError",
        errorMessage: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startedAt,
      }),
    ]);
    throw error;
  }
}

export async function publishAIInteractionApplied(
  eventBus: EventBus,
  context: AIInteractionContext,
): Promise<void> {
  await eventBus.publish([new AIInteractionAppliedEvent({ context })]);
}
