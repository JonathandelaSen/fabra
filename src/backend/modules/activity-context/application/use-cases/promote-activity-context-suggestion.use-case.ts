import { EntityId, Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import { ActivityContext, type ActivityContextType } from "../../domain/entities/activity-context.entity";
import type { ActivityContextRepository } from "../../domain/repositories/activity-context.repository";

export interface PromoteActivityContextSuggestionInput {
  userId: string;
  type: ActivityContextType;
  name: string;
}

export class PromoteActivityContextSuggestionUseCase {
  constructor(
    private readonly deps: {
      activityContextRepo: ActivityContextRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(input: PromoteActivityContextSuggestionInput): Promise<ActivityContext> {
    const userId = UserId.fromPrimitives(input.userId);
    const now = new Date().toISOString();
    const entity = ActivityContext.create({
      id: EntityId.fromPrimitives(crypto.randomUUID()),
      userId,
      type: input.type,
      name: input.name,
      status: "active",
      isDefault: false,
      createdAt: Timestamp.fromPrimitives(now).toPrimitives(),
      updatedAt: Timestamp.fromPrimitives(now).toPrimitives(),
    });

    const saved = await this.deps.activityContextRepo.save(entity);
    const events = entity.pullDomainEvents();
    await this.deps.eventBus.publish(events);
    return saved;
  }
}
