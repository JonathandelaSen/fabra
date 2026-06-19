import { EntityId, LongText, ValueObject } from "@/backend/modules/shared";
import {
  ProcessQuestionCVKind,
  type ProcessQuestionCVType,
} from "./process-question-cv-kind.value-object";

export interface ProcessQuestionRelatedCVPrimitives {
  id: string;
  name: string;
  filename: string | null;
  type: string;
}

export class ProcessQuestionRelatedCV extends ValueObject<ProcessQuestionRelatedCVPrimitives> {
  private constructor(
    private readonly idValue: EntityId,
    private readonly nameValue: LongText,
    private readonly filenameValue: LongText | null,
    private readonly typeValue: ProcessQuestionCVKind
  ) {
    super();
  }

  static fromPrimitives(primitives: ProcessQuestionRelatedCVPrimitives): ProcessQuestionRelatedCV {
    return new ProcessQuestionRelatedCV(
      EntityId.fromPrimitives(primitives.id),
      LongText.fromPrimitives(primitives.name),
      primitives.filename === null ? null : LongText.fromPrimitives(primitives.filename),
      ProcessQuestionCVKind.fromPrimitives(primitives.type)
    );
  }

  get type(): ProcessQuestionCVType {
    return this.typeValue.toPrimitives();
  }

  toPrimitives(): ProcessQuestionRelatedCVPrimitives {
    return {
      id: this.idValue.toPrimitives(),
      name: this.nameValue.toPrimitives(),
      filename: this.filenameValue?.toPrimitives() ?? null,
      type: this.typeValue.toPrimitives(),
    };
  }
}
