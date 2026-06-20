import { UserId } from "@/backend/modules/shared";
import type { CVDataRepository } from "../../domain/repositories/cv-data.repository";
import type { ActivityContextRepository } from "../../domain/repositories/activity-context.repository";
import type { ActivityContextSuggestion } from "../../domain/value-objects/activity-context-suggestion.value-object";
import { ActivityContextHiddenSuggestion } from "../../domain/value-objects/activity-context-hidden-suggestion.value-object";
import {
  activityContextSuggestionKey,
  suggestActivityContextsFromCVs,
} from "../../domain/services/suggest-activity-contexts.service";

export class ListActivityContextSuggestionsUseCase {
  constructor(
    private readonly deps: {
      activityContextRepo: ActivityContextRepository;
      cvDataRepo: CVDataRepository;
    }
  ) {}

  async execute(userId: string): Promise<ActivityContextSuggestion[]> {
    const ownerId = UserId.fromPrimitives(userId);
    const [cvs, contexts, hidden] = await Promise.all([
      this.deps.cvDataRepo.listCVs(userId),
      this.deps.activityContextRepo.search(ownerId),
      this.deps.activityContextRepo.listHiddenSuggestions(ownerId),
    ]);
    const existing = new Set(
      contexts.map((context) =>
        activityContextSuggestionKey(context.toPrimitives().type, context.toPrimitives().name)
      )
    );

    return suggestActivityContextsFromCVs(cvs).filter((suggestion) => {
      const key = activityContextSuggestionKey(suggestion.type, suggestion.name);
      const hiddenSuggestion = ActivityContextHiddenSuggestion.fromPrimitives({
        type: suggestion.type,
        name: suggestion.name,
      });
      return !existing.has(key) && !hidden.has(hiddenSuggestion);
    });
  }
}
