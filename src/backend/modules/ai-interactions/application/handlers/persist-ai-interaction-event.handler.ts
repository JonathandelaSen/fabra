import type { DomainEvent, EventHandler } from "@/modules/shared";
import type { RecordAIInteractionEventUseCase } from "../use-cases/record-ai-interaction-event.use-case";

export class PersistAIInteractionEventHandler implements EventHandler {
  constructor(
    private readonly recordAIInteractionEvent: Pick<
      RecordAIInteractionEventUseCase,
      "execute"
    >,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    const payload = event.toPrimitives() as {
      context: {
        interactionId: string;
        attemptId: string;
        userId: string;
        module: string;
        operation: string;
        entityType: string;
        entityId: string;
        assistanceMode: string;
        provider: string;
        model: string | null;
      };
    };
    const { context } = payload;
    await this.recordAIInteractionEvent.execute({
      id: crypto.randomUUID(),
      interactionId: context.interactionId,
      attemptId: context.attemptId,
      eventName: event.eventName,
      userId: context.userId,
      module: context.module,
      operation: context.operation,
      entityType: context.entityType,
      entityId: context.entityId,
      assistanceMode: context.assistanceMode,
      provider: context.provider,
      model: context.model,
      payload,
      occurredAt: event.occurredAt.toISOString(),
      createdAt: new Date().toISOString(),
    });
  }
}
