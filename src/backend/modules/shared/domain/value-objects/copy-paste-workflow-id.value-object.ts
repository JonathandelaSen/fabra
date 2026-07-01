import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidCopyPasteWorkflowIdError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_COPY_PASTE_WORKFLOW_ID, `Copy paste workflowId cannot be empty.`, { value });
    this.name = "InvalidCopyPasteWorkflowIdError";
  }
}

export class CopyPasteWorkflowId extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): CopyPasteWorkflowId {
    const trimmed = value.trim();
    if (!trimmed) throw new InvalidCopyPasteWorkflowIdError(value);
    return new CopyPasteWorkflowId(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
