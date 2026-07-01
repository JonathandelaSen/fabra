import { DomainError } from "../errors/domain-error";
import { ErrorCode } from "@/shared/error-codes";
import { ValueObject } from "./value-object";

export const COPY_PASTE_RESPONSE_KINDS = ["json", "plain_text"] as const;

export type CopyPasteResponseKindValue = (typeof COPY_PASTE_RESPONSE_KINDS)[number];

class InvalidCopyPasteResponseKindError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_COPY_PASTE_RESPONSE_KIND, `Invalid copy paste response kind: ${value}`, { value });
    this.name = "InvalidCopyPasteResponseKindError";
  }
}

export class CopyPasteResponseKind extends ValueObject<CopyPasteResponseKindValue> {
  private constructor(private readonly value: CopyPasteResponseKindValue) {
    super();
  }

  static fromPrimitives(value: string): CopyPasteResponseKind {
    if (!COPY_PASTE_RESPONSE_KINDS.includes(value as CopyPasteResponseKindValue)) {
      throw new InvalidCopyPasteResponseKindError(value);
    }
    return new CopyPasteResponseKind(value as CopyPasteResponseKindValue);
  }

  static json(): CopyPasteResponseKind {
    return new CopyPasteResponseKind("json");
  }

  static plainText(): CopyPasteResponseKind {
    return new CopyPasteResponseKind("plain_text");
  }

  isJson(): boolean {
    return this.value === "json";
  }

  isPlainText(): boolean {
    return this.value === "plain_text";
  }

  toPrimitives(): CopyPasteResponseKindValue {
    return this.value;
  }
}
