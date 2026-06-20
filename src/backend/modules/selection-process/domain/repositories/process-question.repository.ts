import type { UserId } from "@/backend/modules/shared";
import type { ExecutionResult } from "@/backend/modules/shared";
import type { ProcessQuestion } from "../entities/process-question.entity";
import type { ProcessQuestionId } from "../value-objects/process-question-id.value-object";
import type { ProcessQuestionReadModel } from "../value-objects/process-question-read-model.value-object";

export interface ProcessQuestionSearchCriteria {
  userId: UserId;
  search?: string | null;
  legacyCvId?: string | null;
  sourceJobMatchAnalysisId?: string | null;
  answered?: boolean | null;
}

export interface ProcessQuestionRepository {
  search(criteria: ProcessQuestionSearchCriteria): Promise<ProcessQuestionReadModel[]>;
  findById(
    id: ProcessQuestionId,
    userId: UserId
  ): Promise<ProcessQuestionReadModel | null>;
  save(question: ProcessQuestion): Promise<ProcessQuestionReadModel>;
  delete(id: ProcessQuestionId, userId: UserId): Promise<ExecutionResult>;
}
