import { LongText, StringList, ValueObject } from "@/backend/modules/shared";
import { dropEmpty, type StandardCVEducation } from "../cv-profile";
import { CVDateRange } from "./cv-date-range.value-object";

export type CVEducationPrimitives = StandardCVEducation;

export class CVEducation extends ValueObject<CVEducationPrimitives> {
  private constructor(
    private readonly details: StringList,
    private readonly detailIds: StringList,
    private readonly id?: LongText,
    private readonly institution?: LongText,
    private readonly degree?: LongText,
    private readonly field?: LongText,
    private readonly location?: LongText,
    private readonly dates?: CVDateRange,
  ) {
    super();
  }

  static fromPrimitives(primitives: CVEducationPrimitives): CVEducation {
    const text = (value: string | undefined) =>
      value === undefined ? undefined : LongText.fromPrimitives(value);
    return new CVEducation(
      StringList.fromPrimitives(primitives.details ?? []),
      StringList.fromPrimitives(primitives.detailIds ?? []),
      text(primitives.id),
      text(primitives.institution),
      text(primitives.degree),
      text(primitives.field),
      text(primitives.location),
      primitives.dates === undefined
        ? undefined
        : CVDateRange.fromPrimitives(primitives.dates),
    );
  }

  toPrimitives(): CVEducationPrimitives {
    return dropEmpty({
      id: this.id?.toPrimitives(),
      institution: this.institution?.toPrimitives(),
      degree: this.degree?.toPrimitives(),
      field: this.field?.toPrimitives(),
      location: this.location?.toPrimitives(),
      dates: this.dates?.toPrimitives(),
      details: this.details.toPrimitives(),
      detailIds: this.detailIds.toPrimitives(),
    });
  }
}
