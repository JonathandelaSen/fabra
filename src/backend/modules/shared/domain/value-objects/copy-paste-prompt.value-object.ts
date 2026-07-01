import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

class InvalidCopyPastePromptError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_COPY_PASTE_PROMPT, "Copy paste prompt cannot be empty.", { value });
    this.name = "InvalidCopyPastePromptError";
  }
}

export class CopyPastePrompt extends ValueObject<string> {
  private constructor(private readonly value: string) {
    super();
  }

  static fromPrimitives(value: string): CopyPastePrompt {
    const trimmed = value.trim();
    if (!trimmed) throw new InvalidCopyPastePromptError(value);
    return new CopyPastePrompt(trimmed);
  }

  toPrimitives(): string {
    return this.value;
  }
}
