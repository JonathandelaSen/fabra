import { EntityId } from "@/backend/modules/shared";

export class CVStructuredProfileId extends EntityId {
  private constructor(value: string) {
    super(value, "CV structured profile id");
  }

  static override fromPrimitives(value: string): CVStructuredProfileId {
    return new CVStructuredProfileId(value);
  }
}
