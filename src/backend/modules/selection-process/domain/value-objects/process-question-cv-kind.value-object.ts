import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export const processQuestionCVTypes = {
  uploaded: "uploaded",
  template: "template",
} as const;

export type ProcessQuestionCVType =
  (typeof processQuestionCVTypes)[keyof typeof processQuestionCVTypes];

class InvalidProcessQuestionCVKindError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_PROCESS_QUESTION_CV_KIND, `Invalid process question CV type: ${value}`, { value });
    this.name = "InvalidProcessQuestionCVKindError";
  }
}

export class ProcessQuestionCVKind extends ValueObject<ProcessQuestionCVType> {
  private constructor(private readonly value: ProcessQuestionCVType) {
    super();
  }

  static fromPrimitives(value: string): ProcessQuestionCVKind {
    if (!Object.values(processQuestionCVTypes).includes(value as ProcessQuestionCVType)) {
      throw new InvalidProcessQuestionCVKindError(value);
    }
    return new ProcessQuestionCVKind(value as ProcessQuestionCVType);
  }

  static uploaded(): ProcessQuestionCVKind {
    return new ProcessQuestionCVKind(processQuestionCVTypes.uploaded);
  }

  static template(): ProcessQuestionCVKind {
    return new ProcessQuestionCVKind(processQuestionCVTypes.template);
  }

  isUploaded(): boolean {
    return this.value === processQuestionCVTypes.uploaded;
  }

  isTemplate(): boolean {
    return this.value === processQuestionCVTypes.template;
  }

  toPrimitives(): ProcessQuestionCVType {
    return this.value;
  }
}
