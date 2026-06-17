import { Counter, EntityId, UserId, type EventBus } from "@/modules/shared";
import { ActivityContextNotFoundError } from "../../domain/errors/activity-context-not-found.error";
import { DefaultActivityContextDeleteError } from "../../domain/errors/default-activity-context-delete.error";
import { DefaultActivityContextMissingError } from "../../domain/errors/default-activity-context-missing.error";
import type { ActivityContextRepository } from "../../domain/repositories/activity-context.repository";

export class DeleteActivityContextUseCase {
  constructor(
    private readonly deps: {
      activityContextRepo: ActivityContextRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: { id: string; userId: string }): Promise<Counter> {
    const id = EntityId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const context = await this.deps.activityContextRepo.findById(id, userId);
    if (!context) throw new ActivityContextNotFoundError();
    if (context.isDefault) throw new DefaultActivityContextDeleteError();

    const defaultContext = await this.deps.activityContextRepo.findDefault(userId);
    if (!defaultContext) throw new DefaultActivityContextMissingError();
    const reassignedRecords = await this.deps.activityContextRepo.reassignRecordsToDefault({
      userId,
      sourceContextId: id,
      defaultContextId: EntityId.fromPrimitives(defaultContext.id),
    });
    context.delete();
    await this.deps.activityContextRepo.delete(id, userId);

    const events = context.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return reassignedRecords;
  }
}
