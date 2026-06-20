import { ValueObject } from "@/backend/modules/shared";

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

  static uploaded(): CVDocumentType {
    return new CVDocumentType(cvDocumentTypes.uploaded);
  }

  static template(): CVDocumentType {
    return new CVDocumentType(cvDocumentTypes.template);
  }

  static jsonResume(): CVDocumentType {
    return new CVDocumentType(cvDocumentTypes.jsonResume);
  }

  static fromPrimitives(value: string): CVDocumentType {
    if (!Object.values(cvDocumentTypes).includes(value as CVDocumentTypePrimitives)) {
      throw new Error("Invalid CV document type");
    }
    return new CVDocumentType(value as CVDocumentTypePrimitives);
  }

  isUploaded(): boolean {
    return this.value === cvDocumentTypes.uploaded;
  }

  isTemplate(): boolean {
    return this.value === cvDocumentTypes.template;
  }

  isJsonResume(): boolean {
    return this.value === cvDocumentTypes.jsonResume;
  }

  toPrimitives(): CVDocumentTypePrimitives {
    return this.value;
  }
}
