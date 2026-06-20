import { EntityId } from "@/backend/modules/shared";

export class CVPublicId extends EntityId {
  private constructor(value: string) {
    super(value, "CV public id");
  }

  static fromPrimitives(value: string): CVPublicId {
    return new CVPublicId(value);
  }
}
