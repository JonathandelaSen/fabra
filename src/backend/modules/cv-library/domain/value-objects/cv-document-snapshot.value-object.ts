import { ValueObject } from "@/backend/modules/shared";
import type { CVDocumentPrimitives } from "../entities/cv-document.entity";

export class CVDocumentSnapshot extends ValueObject<unknown> {
  private constructor(private readonly snapshot: CVDocumentPrimitives) {
    super();
  }

  static fromPrimitives(value: CVDocumentPrimitives): CVDocumentSnapshot {
    return new CVDocumentSnapshot(structuredClone(value));
  }

  toPrimitives(): CVDocumentPrimitives {
    return structuredClone(this.snapshot);
  }
}
