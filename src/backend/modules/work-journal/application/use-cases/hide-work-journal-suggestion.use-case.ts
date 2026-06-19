import { ExecutionResult, UserId } from "@/modules/shared";
import type { ContextType } from "../../domain/entities/journal-context.entity";
import type { WorkJournalContextRepository } from "../../domain/repositories/work-journal-context.repository";
import { WorkJournalContextSuggestion } from "../../domain/value-objects/context-suggestion.value-object";

export interface HideWorkJournalSuggestionInput {
  userId: string;
  type: ContextType;
  name: string;
  role_or_label: string | null;
}

export class HideWorkJournalSuggestionUseCase {
  constructor(
    private readonly deps: {
      contextRepo: WorkJournalContextRepository;
    }
  ) {}

  async execute(input: HideWorkJournalSuggestionInput): Promise<ExecutionResult> {
    await this.deps.contextRepo.hideSuggestion(
      UserId.fromPrimitives(input.userId),
      WorkJournalContextSuggestion.fromPrimitives({
        type: input.type,
        name: input.name,
        roleOrLabel: input.role_or_label,
        isCurrent: false,
        source: "cv",
      })
    );
    return ExecutionResult.ok();
  }
}
