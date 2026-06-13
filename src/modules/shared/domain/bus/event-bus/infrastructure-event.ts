import type { DomainEvent } from "./domain-event";

export interface InfrastructureEvent<
  TPrimitives = Record<string, unknown>,
> extends DomainEvent<TPrimitives> {}
