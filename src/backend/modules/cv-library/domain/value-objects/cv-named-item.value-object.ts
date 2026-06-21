import { LongText, StringList, ValueObject } from "@/backend/modules/shared";

export interface CVNamedItemPrimitives {
  id?: string;
  name?: string;
  issuer?: string;
  organization?: string;
  date?: string;
  url?: string;
  description?: string;
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

export class CVNamedItem extends ValueObject<CVNamedItemPrimitives> {
  private constructor(
    private readonly bullets: StringList,
    private readonly bulletIds: StringList,
    private readonly id?: LongText,
    private readonly name?: LongText,
    private readonly issuer?: LongText,
    private readonly organization?: LongText,
    private readonly date?: LongText,
    private readonly url?: LongText,
    private readonly description?: LongText,
  ) {
    super();
  }

  static fromPrimitives(primitives: CVNamedItemPrimitives): CVNamedItem {
    const text = (value: string | undefined) =>
      value === undefined ? undefined : LongText.fromPrimitives(value);
    return new CVNamedItem(
      StringList.fromPrimitives(primitives.bullets ?? []),
      StringList.fromPrimitives(primitives.bulletIds ?? []),
      text(primitives.id),
      text(primitives.name),
      text(primitives.issuer),
      text(primitives.organization),
      text(primitives.date),
      text(primitives.url),
      text(primitives.description),
    );
  }

  toPrimitives(): CVNamedItemPrimitives {
    return dropEmpty({
      id: this.id?.toPrimitives(),
      name: this.name?.toPrimitives(),
      issuer: this.issuer?.toPrimitives(),
      organization: this.organization?.toPrimitives(),
      date: this.date?.toPrimitives(),
      url: this.url?.toPrimitives(),
      description: this.description?.toPrimitives(),
      bullets: this.bullets.toPrimitives(),
      bulletIds: this.bulletIds.toPrimitives(),
    });
  }
}
