import { LongText, ValueObject } from "@/backend/modules/shared";

export interface CVLanguagePrimitives {
  id?: string;
  name?: string;
  level?: string;
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
