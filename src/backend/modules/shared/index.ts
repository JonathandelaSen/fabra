export type { Query } from "./domain/bus/query-bus/query";
export type { QueryBus } from "./domain/bus/query-bus/query-bus";
export type { QueryHandler } from "./domain/bus/query-bus/query-handler";
export { InMemoryQueryBus } from "./infrastructure/bus/query-bus/in-memory-query-bus";
export { UnregisteredQueryHandlerError } from "./domain/bus/query-bus/unregistered-query-handler.error";
export { AggregateRoot } from "./domain/entities/aggregate-root";
export type { DomainEvent } from "./domain/bus/event-bus/domain-event";
export type { InfrastructureEvent } from "./domain/bus/event-bus/infrastructure-event";
export { EntityId } from "./domain/value-objects/entity-id.value-object";
export {
  CopyPastePreparation,
  type CopyPastePreparationPrimitives,
} from "./domain/value-objects/copy-paste-preparation.value-object";
export { type CopyPasteExpectedResponsePrimitives } from "./domain/value-objects/copy-paste-expected-response.value-object";
export { IsoDate } from "./domain/value-objects/iso-date.value-object";
export { OptionalIsoDate } from "./domain/value-objects/optional-iso-date.value-object";
export { Timestamp } from "./domain/value-objects/timestamp.value-object";
export { OptionalTimestamp } from "./domain/value-objects/optional-timestamp.value-object";
export { UserId } from "./domain/value-objects/user-id.value-object";
export { ValueObject } from "./domain/value-objects/value-object";
export { Counter } from "./domain/value-objects/counter.value-object";
export { LongText } from "./domain/value-objects/long-text.value-object";
export { Url } from "./domain/value-objects/url.value-object";
export {
  Link,
  type LinkPrimitives,
} from "./domain/value-objects/link.value-object";
export { StringList } from "./domain/value-objects/string-list.value-object";
export { BooleanFlag } from "./domain/value-objects/boolean-flag.value-object";
export {
  CopyPasteOriginLabel,
  COPY_PASTE_ORIGIN_LABEL,
  type CopyPasteOriginLabelValue,
} from "./domain/value-objects/copy-paste-origin-label.value-object";
export { ExecutionResult } from "./domain/value-objects/execution-result.value-object";
export type { AIProvider } from "./domain/value-objects/ai-provider.value-object";
export { AI_PROVIDER, AI_PROVIDERS, isAIProvider, parseAIProvider, AIProviderValue } from "./domain/value-objects/ai-provider.value-object";
export {
  AIAssistanceMode,
  AIEntityType,
  AIInteractionFailureStage,
  AIInteractionProvider,
  AIModule,
  AIOperation,
} from "./domain/ai-runtime/ai-runtime.types";
export type { AIInteractionContext } from "./domain/ai-runtime/ai-runtime.types";
export {
  AIInfrastructureEventName,
  AIInteractionAppliedEvent,
  AIInteractionFailedEvent,
  AIInteractionPreparedEvent,
  AIInteractionRequestSentEvent,
  AIInteractionResponseReceivedEvent,
  AIInteractionResponseValidatedEvent,
} from "./domain/ai-runtime/ai-runtime.events";
export { BoundSupabaseRepository } from "./infrastructure/repositories/bound-supabase-repository";
export { assertAIProviderAllowedForRuntime } from "./infrastructure/ai-provider-runtime-guard";
export { DomainError } from "./domain/errors/domain-error";
export { InvalidApiKeyError } from "./domain/errors/invalid-api-key.error";
export {
  HttpError,
  notFound,
  badRequest,
  forbidden,
  conflict,
  ok,
  created,
  errorResponse,
} from "./infrastructure/http/api-errors";
export { createApiErrorHandler } from "./infrastructure/http/create-api-error-handler";
export type { SupabaseAware } from "./infrastructure/supabase-aware";
export type {
  Telemetry,
  TelemetryAttribute,
  TelemetryCaptureOptions,
  TelemetryLogLevel,
  TelemetryLogOptions,
  TelemetrySpanOptions,
  TelemetryUser,
} from "./application/telemetry/telemetry";
export { NoOpTelemetry } from "./infrastructure/telemetry/no-op-telemetry";
export { SentryTelemetry } from "./infrastructure/telemetry/sentry-telemetry";
export { instrumentUseCases } from "./infrastructure/telemetry/instrument-use-cases";
export type { EventBus, EventHandler } from "./domain/bus/event-bus/event-bus";
export { InMemoryEventBus } from "./infrastructure/bus/event-bus/in-memory-event-bus";
export {
  createIntegratedAIInteractionContext,
  publishAIInteractionApplied,
  runTrackedAIInteraction,
  serializeAIInteractionPrompt,
} from "./application/ai-runtime/track-integrated-ai-interaction";
