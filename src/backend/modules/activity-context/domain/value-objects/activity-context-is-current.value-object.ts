import { ValueObject } from "@/backend/modules/shared";

export class ActivityContextIsCurrent extends ValueObject<boolean> {
  private constructor(private readonly value: boolean) {
    super();
  }

  static fromPrimitives(value: boolean): ActivityContextIsCurrent {
    return new ActivityContextIsCurrent(value);
  }

  toPrimitives(): boolean {
    return this.value;
  }
}
