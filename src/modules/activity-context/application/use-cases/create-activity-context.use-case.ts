import { EntityId, UserId, type EventBus } from "@/modules/shared";
import { ActivityContext, type ActivityContextType } from "../../domain/entities/activity-context.entity";
import type { ActivityContextRepository } from "../../domain/repositories/activity-context.repository";

export interface CreateActivityContextInput {
  userId: string;
  type: ActivityContextType;
  name: string;
}

export class CreateActivityContextUseCase {
  constructor(
    private readonly deps: {
      activityContextRepo: ActivityContextRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: CreateActivityContextInput): Promise<ActivityContext> {
    const now = new Date().toISOString();
    const context = ActivityContext.create({
      id: EntityId.fromPrimitives(crypto.randomUUID()),
      userId: UserId.fromPrimitives(input.userId),
      type: input.type,
      name: input.name,
      status: "active",
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    });

    await this.deps.activityContextRepo.save(context);

    const events = context.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return context;
  }
}
