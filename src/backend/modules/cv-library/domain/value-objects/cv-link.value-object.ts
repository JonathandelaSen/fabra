import { LongText, ValueObject } from "@/backend/modules/shared";

export interface CVLinkPrimitives {
  label?: string;
  url: string;
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

export class CVLink extends ValueObject<CVLinkPrimitives> {
  private constructor(
    private readonly url: LongText,
    private readonly label?: LongText,
  ) {
    super();
  }

  static fromPrimitives(primitives: CVLinkPrimitives): CVLink {
    return new CVLink(
      LongText.fromPrimitives(primitives.url),
      primitives.label === undefined
        ? undefined
        : LongText.fromPrimitives(primitives.label),
    );
  }

  toPrimitives(): CVLinkPrimitives {
    return dropEmpty({
      label: this.label?.toPrimitives(),
      url: this.url.toPrimitives(),
    }) as CVLinkPrimitives;
  }
}
