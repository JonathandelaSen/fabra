import type { InfrastructureEvent } from "../bus/event-bus/infrastructure-event";
import type {
  AIInteractionContext,
  AIInteractionFailureStage,
} from "./ai-runtime.types";

export enum AIInfrastructureEventName {
  Prepared = "ai_runtime.prompt_prepared",
  RequestSent = "ai_runtime.request_sent",
  ResponseReceived = "ai_runtime.response_received",
  ResponseValidated = "ai_runtime.response_validated",
  Applied = "ai_runtime.result_applied",
  Failed = "ai_runtime.failed",
}

abstract class AIInfrastructureEvent<T extends Record<string, unknown>>
  implements InfrastructureEvent<T>
{
  readonly occurredAt = new Date();
  abstract readonly eventName: AIInfrastructureEventName;

  constructor(protected readonly primitives: T) {}

  toPrimitives(): T {
    return this.primitives;
  }
}

export class AIInteractionPreparedEvent extends AIInfrastructureEvent<{
  context: AIInteractionContext;
  prompt: string;
}> {
  readonly eventName = AIInfrastructureEventName.Prepared;
}

export class AIInteractionRequestSentEvent extends AIInfrastructureEvent<{
  context: AIInteractionContext;
}> {
  readonly eventName = AIInfrastructureEventName.RequestSent;
}

export class AIInteractionResponseReceivedEvent extends AIInfrastructureEvent<{
  context: AIInteractionContext;
  rawResponse: string;
  durationMs?: number;
}> {
  readonly eventName = AIInfrastructureEventName.ResponseReceived;
}

export class AIInteractionResponseValidatedEvent extends AIInfrastructureEvent<{
  context: AIInteractionContext;
  parsedResult: unknown;
}> {
  readonly eventName = AIInfrastructureEventName.ResponseValidated;
}

export class AIInteractionAppliedEvent extends AIInfrastructureEvent<{
  context: AIInteractionContext;
}> {
  readonly eventName = AIInfrastructureEventName.Applied;
}

export class AIInteractionFailedEvent extends AIInfrastructureEvent<{
  context: AIInteractionContext;
  stage: AIInteractionFailureStage;
  errorName: string;
  errorMessage: string;
  durationMs?: number;
}> {
  readonly eventName = AIInfrastructureEventName.Failed;
}
