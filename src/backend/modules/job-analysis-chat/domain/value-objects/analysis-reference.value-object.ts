import { EntityId, ValueObject } from "@/backend/modules/shared";
import {
  AnalysisReferenceKind,
  analysisReferenceTypes,
  type AnalysisReferenceType,
} from "./analysis-reference-kind.value-object";

export { analysisReferenceTypes };
export type { AnalysisReferenceType };

export interface AnalysisReferencePrimitives {
  readonly type: string;
  readonly id: string;
}

export class AnalysisReference extends ValueObject<AnalysisReferencePrimitives> {
  private constructor(
    private readonly kind: AnalysisReferenceKind,
    private readonly idValue: EntityId
  ) {
    super();
  }

  static fromPrimitives(value: AnalysisReferencePrimitives): AnalysisReference {
    return new AnalysisReference(
      AnalysisReferenceKind.fromPrimitives(value.type),
      EntityId.fromPrimitives(value.id)
    );
  }

  get type(): AnalysisReferenceType {
    return this.kind.toPrimitives();
  }

  get id(): string {
    return this.idValue.toPrimitives();
  }

  toPrimitives(): AnalysisReferencePrimitives {
    return {
      type: this.kind.toPrimitives(),
      id: this.idValue.toPrimitives(),
    };
  }
}
