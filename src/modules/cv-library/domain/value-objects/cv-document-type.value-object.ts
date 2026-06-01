import { ValueObject } from "@/modules/shared";

export type CVDocumentTypePrimitives = "uploaded" | "template" | "json_resume";

export class CVDocumentType extends ValueObject<CVDocumentTypePrimitives> {
  private constructor(private readonly value: CVDocumentTypePrimitives) {
    super();
  }

  static fromPrimitives(value: string): CVDocumentType {
    if (
      value !== "uploaded" &&
      value !== "template" &&
      value !== "json_resume"
    ) {
      throw new Error("Invalid CV document type");
    }
    return new CVDocumentType(value);
  }

  toPrimitives(): CVDocumentTypePrimitives {
    return this.value;
  }
}
