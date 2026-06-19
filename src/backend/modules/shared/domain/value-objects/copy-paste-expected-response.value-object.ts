import { ValueObject } from "./value-object";
import { CopyPasteResponseEnvelope } from "./copy-paste-response-envelope.value-object";
import { CopyPasteResponseKind } from "./copy-paste-response-kind.value-object";

export interface CopyPasteExpectedResponsePrimitives {
  kind: string;
  envelope: boolean | null;
}

export class CopyPasteExpectedResponse extends ValueObject<CopyPasteExpectedResponsePrimitives> {
  private constructor(
    private readonly kind: CopyPasteResponseKind,
    private readonly envelope: CopyPasteResponseEnvelope,
  ) {
    super();
  }

  static fromPrimitives(
    primitives: CopyPasteExpectedResponsePrimitives,
  ): CopyPasteExpectedResponse {
    return new CopyPasteExpectedResponse(
      CopyPasteResponseKind.fromPrimitives(primitives.kind),
      CopyPasteResponseEnvelope.fromPrimitives(primitives.envelope),
    );
  }

  toPrimitives(): CopyPasteExpectedResponsePrimitives {
    return {
      kind: this.kind.toPrimitives(),
      envelope: this.envelope.toPrimitives(),
    };
  }
}
