import { DomainError } from "@/modules/shared/domain/errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";

export class AnalysisContextNotFoundError extends DomainError {
  constructor() {
    super(ErrorCode.ANALYSIS_NOT_FOUND, "Analysis not found");
    this.name = "AnalysisContextNotFoundError";
  }
}
