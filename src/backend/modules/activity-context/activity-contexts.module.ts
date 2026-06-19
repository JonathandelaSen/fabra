import type { SupabaseClient } from "@supabase/supabase-js";
import { CountActivityContextRecordsUseCase } from "./application/use-cases/count-activity-context-records.use-case";
import { CreateActivityContextUseCase } from "./application/use-cases/create-activity-context.use-case";
import { DeleteActivityContextUseCase } from "./application/use-cases/delete-activity-context.use-case";
import { PromoteActivityContextSuggestionUseCase } from "./application/use-cases/promote-activity-context-suggestion.use-case";
import { HideActivityContextSuggestionUseCase } from "./application/use-cases/hide-activity-context-suggestion.use-case";
import { ListActivityContextSuggestionsUseCase } from "./application/use-cases/list-activity-context-suggestions.use-case";
import { ListActivityContextsUseCase } from "./application/use-cases/list-activity-contexts.use-case";
import { UpdateActivityContextUseCase } from "./application/use-cases/update-activity-context.use-case";
import { instrumentUseCases, type Telemetry, type EventBus } from "@/modules/shared";
import { SupabaseActivityContextRepository } from "./infrastructure/repositories/supabase-activity-context.repository";
import { SupabaseCVDataRepository } from "./infrastructure/repositories/supabase-cv-data.repository";

const activityContextRepo = new SupabaseActivityContextRepository();
const cvDataRepo = new SupabaseCVDataRepository();

function createUseCases(eventBus: EventBus) {
  return {
    listActivityContexts: new ListActivityContextsUseCase({ activityContextRepo }),
    listActivityContextSuggestions: new ListActivityContextSuggestionsUseCase({
      activityContextRepo,
      cvDataRepo,
    }),
    createActivityContext: new CreateActivityContextUseCase({ activityContextRepo, eventBus }),
    updateActivityContext: new UpdateActivityContextUseCase({ activityContextRepo, eventBus }),
    deleteActivityContext: new DeleteActivityContextUseCase({ activityContextRepo, eventBus }),
    countActivityContextRecords: new CountActivityContextRecordsUseCase({ activityContextRepo }),
    promoteActivityContextSuggestion: new PromoteActivityContextSuggestionUseCase({
      activityContextRepo,
      eventBus,
    }),
    hideActivityContextSuggestion: new HideActivityContextSuggestionUseCase({
      activityContextRepo,
    }),
  };
}

export type ActivityContextsModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): ActivityContextsModule;
};

export function createActivityContextsModule(telemetry: Telemetry, eventBus: EventBus): ActivityContextsModule {
  const useCases = instrumentUseCases("activity-context", createUseCases(eventBus), telemetry);

  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      activityContextRepo.bindRequest(client);
      cvDataRepo.bindRequest(client);
      return this;
    },
  };
}
