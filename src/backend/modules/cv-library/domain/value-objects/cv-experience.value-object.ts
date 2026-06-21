import { LongText, StringList, ValueObject } from "@/backend/modules/shared";
import {
  CVDateRange,
  type CVDateRangePrimitives,
} from "./cv-date-range.value-object";

export interface CVExperiencePrimitives {
  id?: string;
  company?: string;
  role?: string;
  location?: string;
  dates?: CVDateRangePrimitives;
  bullets?: string[];
  bulletIds?: string[];
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

export class CVExperience extends ValueObject<CVExperiencePrimitives> {
  private constructor(
    private readonly bullets: StringList,
    private readonly bulletIds: StringList,
    private readonly id?: LongText,
    private readonly company?: LongText,
    private readonly role?: LongText,
    private readonly location?: LongText,
    private readonly dates?: CVDateRange,
  ) {
    super();
  }

  static fromPrimitives(primitives: CVExperiencePrimitives): CVExperience {
    const text = (value: string | undefined) =>
      value === undefined ? undefined : LongText.fromPrimitives(value);
    return new CVExperience(
      StringList.fromPrimitives(primitives.bullets ?? []),
      StringList.fromPrimitives(primitives.bulletIds ?? []),
      text(primitives.id),
      text(primitives.company),
      text(primitives.role),
      text(primitives.location),
      primitives.dates === undefined
        ? undefined
        : CVDateRange.fromPrimitives(primitives.dates),
    );
  }

  toPrimitives(): CVExperiencePrimitives {
    return dropEmpty({
      id: this.id?.toPrimitives(),
      company: this.company?.toPrimitives(),
      role: this.role?.toPrimitives(),
      location: this.location?.toPrimitives(),
      dates: this.dates?.toPrimitives(),
      bullets: this.bullets.toPrimitives(),
      bulletIds: this.bulletIds.toPrimitives(),
    });
  }
}
