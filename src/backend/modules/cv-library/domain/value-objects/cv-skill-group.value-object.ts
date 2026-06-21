import { LongText, StringList, ValueObject } from "@/backend/modules/shared";

export interface CVSkillGroupPrimitives {
  id?: string;
  name?: string;
  items?: string[];
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

export class CVSkillGroup extends ValueObject<CVSkillGroupPrimitives> {
  private constructor(
    private readonly items: StringList,
    private readonly id?: LongText,
    private readonly name?: LongText,
  ) {
    super();
  }

  static fromPrimitives(primitives: CVSkillGroupPrimitives): CVSkillGroup {
    const text = (value: string | undefined) =>
      value === undefined ? undefined : LongText.fromPrimitives(value);
    return new CVSkillGroup(
      StringList.fromPrimitives(primitives.items ?? []),
      text(primitives.id),
      text(primitives.name),
    );
  }

  toPrimitives(): CVSkillGroupPrimitives {
    return dropEmpty({
      id: this.id?.toPrimitives(),
      name: this.name?.toPrimitives(),
      items: this.items.toPrimitives(),
    });
  }
}
