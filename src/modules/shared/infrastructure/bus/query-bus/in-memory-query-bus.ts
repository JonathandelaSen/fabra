import type { Query } from "../../../domain/bus/query-bus/query";
import type { QueryBus } from "../../../domain/bus/query-bus/query-bus";
import type { QueryHandler } from "../../../domain/bus/query-bus/query-handler";
import { UnregisteredQueryHandlerError } from "../../../domain/bus/query-bus/unregistered-query-handler.error";
import type { Telemetry } from "../../../application/telemetry/telemetry";

export class InMemoryQueryBus implements QueryBus {
  private readonly handlers = new Map<string, QueryHandler<Query<unknown, unknown>, unknown>>();

  constructor(private readonly telemetry: Telemetry) {}

  register<TResult>(
    queryName: string,
    handler: QueryHandler<Query<unknown, TResult>, TResult>
  ): void {
    if (this.handlers.has(queryName)) {
      throw new Error(`Query handler already registered for "${queryName}".`);
    }

    this.handlers.set(
      queryName,
      handler as QueryHandler<Query<unknown, unknown>, unknown>
    );
  }

  async execute<TResult>(query: Query<unknown, TResult>): Promise<TResult> {
    return this.telemetry.trace(
      {
        name: `query_bus.execute ${query.queryName}`,
        operation: "query_bus.execute",
        attributes: {
          "fabra.layer": "application",
          "fabra.query": query.queryName,
        },
      },
      async () => {
        const handler = this.handlers.get(query.queryName);
        if (!handler) {
          throw new UnregisteredQueryHandlerError(query.queryName);
        }

        return handler.handle(query) as Promise<TResult>;
      },
    );
  }
}
