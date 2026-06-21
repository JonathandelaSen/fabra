import { LongText, StringList, ValueObject } from "@/backend/modules/shared";
import {
  CVDateRange,
  type CVDateRangePrimitives,
} from "./cv-date-range.value-object";

export interface CVEducationPrimitives {
  id?: string;
  institution?: string;
  degree?: string;
  field?: string;
  location?: string;
  dates?: CVDateRangePrimitives;
  details?: string[];
  detailIds?: string[];
}

const dropEmpty = <T extends Record<string, unknown>>(value: T): T => {
  for (const key of Object.keys(value)) {
    if (
      value[key] === undefined ||
      (Array.isArray(value[key]) && value[key].length === 0)
    ) {
      delete value[key];
    }
  }
  return value;
};

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
