export type { EventTracker, ProcessingEventInput } from "./domain/repositories/event-tracker.repository";
export type { Query } from "./application/query-bus/query";
export type { QueryBus } from "./application/query-bus/query-bus";
export type { QueryHandler } from "./application/query-bus/query-handler";
export { InMemoryQueryBus } from "./application/query-bus/in-memory-query-bus";
export { UnregisteredQueryHandlerError } from "./application/query-bus/unregistered-query-handler.error";
export { AggregateRoot } from "./domain/entities/aggregate-root";
export type { DomainEvent } from "./domain/events/domain-event";
export { EntityId } from "./domain/value-objects/entity-id.value-object";
export { IsoDate } from "./domain/value-objects/iso-date.value-object";
export { OptionalIsoDate } from "./domain/value-objects/optional-iso-date.value-object";
export { Timestamp } from "./domain/value-objects/timestamp.value-object";
export { UserId } from "./domain/value-objects/user-id.value-object";
export { ValueObject } from "./domain/value-objects/value-object";
export type { AIProvider } from "./domain/value-objects/ai-provider.value-object";
export { AI_PROVIDER, AI_PROVIDERS, isAIProvider, parseAIProvider } from "./domain/value-objects/ai-provider.value-object";
export { SupabaseEventTracker } from "./infrastructure/repositories/supabase-event-tracker.repository";
export { BoundSupabaseRepository } from "./infrastructure/repositories/bound-supabase-repository";
export { assertAIProviderAllowedForRuntime } from "./infrastructure/ai-provider-runtime-guard";
export { DomainError } from "./domain/errors/domain-error";
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
  TelemetrySpanOptions,
  TelemetryUser,
} from "./application/telemetry/telemetry";
export { NoOpTelemetry } from "./infrastructure/telemetry/no-op-telemetry";
export { SentryTelemetry } from "./infrastructure/telemetry/sentry-telemetry";
export { instrumentUseCases } from "./infrastructure/telemetry/instrument-use-cases";
