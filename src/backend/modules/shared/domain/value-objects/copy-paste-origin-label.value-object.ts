import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

export const COPY_PASTE_ORIGIN_LABEL = "external_chat" as const;

export type CopyPasteOriginLabelValue = typeof COPY_PASTE_ORIGIN_LABEL;

class InvalidCopyPasteOriginLabelError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_COPY_PASTE_ORIGIN_LABEL, `Invalid copy-paste origin label: ${value}`, { value });
    this.name = "InvalidCopyPasteOriginLabelError";
  }
}

export class CopyPasteOriginLabel extends ValueObject<CopyPasteOriginLabelValue> {
  private constructor(private readonly value: CopyPasteOriginLabelValue) {
    super();
  }

  static fromPrimitives(value: string): CopyPasteOriginLabel {
    if (value !== COPY_PASTE_ORIGIN_LABEL) {
      throw new InvalidCopyPasteOriginLabelError(value);
    }
    return new CopyPasteOriginLabel(value);
  }

  toPrimitives(): CopyPasteOriginLabelValue {
    return this.value;
  }
}
