import type { QueryHandler } from "@/backend/modules/shared";
import { GetJobAnalysisChatContextUseCase } from "../use-cases/get-job-analysis-chat-context.use-case";
import {
  GetJobAnalysisChatContextQuery,
  type GetJobAnalysisChatContextInput,
} from "./get-job-analysis-chat-context.query";
import type { JobAnalysisChatContext } from "../../domain/value-objects/job-analysis-chat-context.value-object";

export class GetJobAnalysisChatContextQueryHandler implements QueryHandler<
  GetJobAnalysisChatContextQuery,
  JobAnalysisChatContext | null
> {
  constructor(private readonly useCase: GetJobAnalysisChatContextUseCase) {}

  async handle(query: GetJobAnalysisChatContextQuery) {
    return this.useCase.execute(query.payload);
  }
}

export type { GetJobAnalysisChatContextInput };
