import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

class InvalidInterviewAnswerError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_INTERVIEW_ANSWER, "Interview answer cannot be empty.", { value });
    this.name = "InvalidInterviewAnswerError";
  }
}

export class InterviewAnswer extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
    if (!value.trim()) throw new InvalidInterviewAnswerError(value);
  }

  static fromPrimitives(value: string): InterviewAnswer {
    return new InterviewAnswer(value);
  }

  toPrimitives(): string {
    return this.value;
  }
}
