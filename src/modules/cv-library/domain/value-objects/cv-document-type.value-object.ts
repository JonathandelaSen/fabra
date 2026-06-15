import { ValueObject } from "@/modules/shared";

export const cvDocumentTypes = {
  uploaded: "uploaded",
  template: "template",
  jsonResume: "json_resume",
} as const;

export type CVDocumentTypePrimitives =
  (typeof cvDocumentTypes)[keyof typeof cvDocumentTypes];

export class CVDocumentType extends ValueObject<CVDocumentTypePrimitives> {
  private constructor(private readonly value: CVDocumentTypePrimitives) {
    super();
  }

  static fromPrimitives(value: string): CVDocumentType {
    if (
      value !== cvDocumentTypes.uploaded &&
      value !== cvDocumentTypes.template &&
      value !== cvDocumentTypes.jsonResume
    ) {
      throw new Error("Invalid CV document type");
    }
    return new CVDocumentType(value);
  }

  toPrimitives(): CVDocumentTypePrimitives {
    return this.value;
  }
}
