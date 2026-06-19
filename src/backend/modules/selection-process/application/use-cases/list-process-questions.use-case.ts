import type { ProcessQuestionReadModel, ProcessQuestionRelatedCVPrimitives, ProcessQuestionRelatedAnalysisPrimitives } from "../../domain/value-objects/process-question-read-model.value-object";
import { UserId } from "@/backend/modules/shared";
import type {
  ProcessQuestionRepository,
} from "../../domain/repositories/process-question.repository";

export interface ListProcessQuestionsInput {
  userId: string;
  search?: string | null;
  cvId?: string | null;
  analysisId?: string | null;
  answered?: boolean | null;
}

export class ListProcessQuestionsUseCase {
  constructor(
    private readonly deps: { questionRepo: ProcessQuestionRepository }
  ) {}

  async execute(
    input: ListProcessQuestionsInput
  ): Promise<ProcessQuestionReadModel[]> {
    return this.deps.questionRepo.search({
      userId: UserId.fromPrimitives(input.userId),
      search: input.search,
      legacyCvId: input.cvId,
      sourceJobMatchAnalysisId: input.analysisId,
      answered: input.answered,
    });
  }
}
