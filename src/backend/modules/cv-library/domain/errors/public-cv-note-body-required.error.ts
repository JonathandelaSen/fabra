import { DomainError } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export class PublicCVNoteBodyRequiredError extends DomainError {
  constructor() {
    super(ErrorCode.PUBLIC_CV_NOTE_BODY_REQUIRED, "CV public note body is required");
    this.name = "PublicCVNoteBodyRequiredError";
  }
}
