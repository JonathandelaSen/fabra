import { EntityId, ValueObject } from "@/backend/modules/shared";

export interface CVDocumentReferencePrimitives {
  readonly id: string;
}

export class CVDocumentReference extends ValueObject<CVDocumentReferencePrimitives> {
  private constructor(private readonly idValue: EntityId) {
    super();
  }

  static fromPrimitives(value: CVDocumentReferencePrimitives): CVDocumentReference {
    return new CVDocumentReference(EntityId.fromPrimitives(value.id));
  }

  get id(): string {
    return this.idValue.toPrimitives();
  }

  toPrimitives(): CVDocumentReferencePrimitives {
    return { id: this.idValue.toPrimitives() };
  }
}
