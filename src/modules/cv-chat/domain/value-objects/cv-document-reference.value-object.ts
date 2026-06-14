import { ValueObject } from "@/modules/shared";

export interface CVDocumentReferencePrimitives {
  readonly id: string;
}

export class CVDocumentReference extends ValueObject<CVDocumentReferencePrimitives> {
  private constructor(private readonly value: CVDocumentReferencePrimitives) {
    super();
    if (!value.id.trim()) throw new Error("CV document reference id cannot be empty.");
  }

  static fromPrimitives(value: CVDocumentReferencePrimitives): CVDocumentReference {
    return new CVDocumentReference({
      id: value.id.trim(),
    });
  }

  toPrimitives(): CVDocumentReferencePrimitives {
    return { ...this.value };
  }
}
