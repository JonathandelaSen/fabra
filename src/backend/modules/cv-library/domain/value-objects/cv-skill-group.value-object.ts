import { LongText, StringList, ValueObject } from "@/backend/modules/shared";
import { dropEmpty, type StandardCVSkillGroup } from "../cv-profile";

export type CVSkillGroupPrimitives = StandardCVSkillGroup;

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
