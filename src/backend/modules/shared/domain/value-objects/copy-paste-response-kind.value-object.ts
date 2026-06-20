import { ValueObject } from "./value-object";

export const COPY_PASTE_RESPONSE_KINDS = ["json", "plain_text"] as const;

export type CopyPasteResponseKindValue = (typeof COPY_PASTE_RESPONSE_KINDS)[number];

export class CopyPasteResponseKind extends ValueObject<CopyPasteResponseKindValue> {
  private constructor(private readonly value: CopyPasteResponseKindValue) {
    super();
  }

  static fromPrimitives(value: string): CopyPasteResponseKind {
    if (!COPY_PASTE_RESPONSE_KINDS.includes(value as CopyPasteResponseKindValue)) {
      throw new Error(`Invalid copy paste response kind: ${value}`);
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
