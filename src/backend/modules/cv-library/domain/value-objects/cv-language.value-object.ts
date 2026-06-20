import { LongText, ValueObject } from "@/backend/modules/shared";
import { dropEmpty, type StandardCVLanguage } from "../cv-profile";

export type CVLanguagePrimitives = StandardCVLanguage;

export class CVLanguage extends ValueObject<CVLanguagePrimitives> {
  private constructor(
    private readonly id?: LongText,
    private readonly name?: LongText,
    private readonly level?: LongText,
  ) {
    super();
  }

  static fromPrimitives(primitives: CVLanguagePrimitives): CVLanguage {
    const text = (value: string | undefined) =>
      value === undefined ? undefined : LongText.fromPrimitives(value);
    return new CVLanguage(
      text(primitives.id),
      text(primitives.name),
      text(primitives.level),
    );
  }

  toPrimitives(): CVLanguagePrimitives {
    return dropEmpty({
      id: this.id?.toPrimitives(),
      name: this.name?.toPrimitives(),
      level: this.level?.toPrimitives(),
    });
  }
}
