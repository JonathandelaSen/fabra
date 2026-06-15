import { EntityId, Timestamp, UserId, type EventBus } from "@/modules/shared";
import { ActivityContext, type ActivityContextType } from "../../domain/entities/activity-context.entity";
import type { ActivityContextRepository } from "../../domain/repositories/activity-context.repository";
import {
  ACTIVITY_CONTEXT_SUGGESTION_ACTIONS,
  type ActivityContextSuggestionAction,
} from "../activity-context-suggestion.constants";

export interface HandleActivityContextSuggestionInput {
  userId: string;
  action: ActivityContextSuggestionAction;
  type: ActivityContextType;
  name: string;
  roleOrLabel: string | null;
}

export class HandleActivityContextSuggestionUseCase {
  constructor(
    private readonly deps: {
      activityContextRepo: ActivityContextRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(
    input: HandleActivityContextSuggestionInput
  ): Promise<{ ok: true } | ActivityContext> {
    const userId = UserId.fromPrimitives(input.userId);
    if (input.action === ACTIVITY_CONTEXT_SUGGESTION_ACTIONS.HIDE) {
      await this.deps.activityContextRepo.hideSuggestion(userId, input);
      return { ok: true };
    }

    const now = new Date().toISOString();
    const context = await this.deps.activityContextRepo.save(
      ActivityContext.create({
        id: EntityId.fromPrimitives(crypto.randomUUID()),
        userId,
        type: input.type,
        name: input.name,
        status: "active",
        isDefault: false,
        createdAt: Timestamp.fromPrimitives(now).toPrimitives(),
        updatedAt: Timestamp.fromPrimitives(now).toPrimitives(),
      })
    );
    const events = context.pullDomainEvents();
    await this.deps.eventBus.publish(events);
    return context;
  }
}
