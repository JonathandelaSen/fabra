import { ValueObject } from "./value-object";

export const COPY_PASTE_ORIGIN_LABEL = "external_chat" as const;

export type CopyPasteOriginLabelValue = typeof COPY_PASTE_ORIGIN_LABEL;

export class CopyPasteOriginLabel extends ValueObject<CopyPasteOriginLabelValue> {
  private constructor(private readonly value: CopyPasteOriginLabelValue) {
    super();
  }

  static fromPrimitives(value: string): CopyPasteOriginLabel {
    if (value !== COPY_PASTE_ORIGIN_LABEL) {
      throw new Error(`Invalid copy-paste origin label: ${value}`);
    }
    return new CopyPasteOriginLabel(value);
  }

  toPrimitives(): CopyPasteOriginLabelValue {
    return this.value;
  }
}
