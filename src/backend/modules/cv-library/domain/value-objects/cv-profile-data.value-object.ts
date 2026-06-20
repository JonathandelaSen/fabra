import { ValueObject } from "@/backend/modules/shared";

export class CVProfileData extends ValueObject<unknown> {
  private constructor(private readonly value: unknown) {
    super();
  }

  static fromPrimitives(value: unknown): CVProfileData {
    return new CVProfileData(value ?? null);
  }

  toPrimitives(): unknown {
    return this.value;
  }
}
