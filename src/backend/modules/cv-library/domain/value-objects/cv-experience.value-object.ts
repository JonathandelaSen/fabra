import { LongText, StringList, ValueObject } from "@/backend/modules/shared";
import { dropEmpty, type StandardCVExperience } from "../cv-profile";
import { CVDateRange } from "./cv-date-range.value-object";

export type CVExperiencePrimitives = StandardCVExperience;

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
