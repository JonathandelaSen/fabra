import { ExecutionResult, UserId } from "@/backend/modules/shared";
import type { ActivityContextType } from "../../domain/entities/activity-context.entity";
import type { ActivityContextRepository } from "../../domain/repositories/activity-context.repository";
import { ActivityContextHiddenSuggestion } from "../../domain/value-objects/activity-context-hidden-suggestion.value-object";

export interface HideActivityContextSuggestionInput {
  userId: string;
  type: ActivityContextType;
  name: string;
}

export class HideActivityContextSuggestionUseCase {
  constructor(
    private readonly deps: {
      activityContextRepo: ActivityContextRepository;
    }
  ) {}

  async execute(input: HideActivityContextSuggestionInput): Promise<ExecutionResult> {
    const userId = UserId.fromPrimitives(input.userId);
    await this.deps.activityContextRepo.hideSuggestion(
      userId,
      ActivityContextHiddenSuggestion.fromPrimitives({
        type: input.type,
        name: input.name,
      })
    );
    return ExecutionResult.ok();
  }
}
