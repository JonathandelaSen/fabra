import { ValueObject } from "@/modules/shared";

export class ActivityContextRoleOrLabel extends ValueObject<string | null> {
  private constructor(private readonly value: string | null) {
    super();
  }

  static fromPrimitives(value: string | null): ActivityContextRoleOrLabel {
    return new ActivityContextRoleOrLabel(value?.trim() || null);
  }

  toPrimitives(): string | null {
    return this.value;
  }
}
