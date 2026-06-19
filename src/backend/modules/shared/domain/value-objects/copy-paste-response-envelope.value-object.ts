import { ValueObject } from "./value-object";

export class CopyPasteResponseEnvelope extends ValueObject<boolean | null> {
  private constructor(private readonly value: boolean | null) {
    super();
  }

  static fromPrimitives(value: boolean | null): CopyPasteResponseEnvelope {
    return new CopyPasteResponseEnvelope(value);
  }

  toPrimitives(): boolean | null {
    return this.value;
  }
}
