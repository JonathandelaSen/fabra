import { EntityId } from "@/backend/modules/shared";

export class CVDocumentId extends EntityId {
  private constructor(value: string) {
    super(value, "CV document id");
  }

  static override fromPrimitives(value: string): CVDocumentId {
    return new CVDocumentId(value);
  }
}
