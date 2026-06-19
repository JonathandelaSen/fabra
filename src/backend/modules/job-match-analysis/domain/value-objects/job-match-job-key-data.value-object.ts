import { ValueObject } from "@/backend/modules/shared";

export class JobMatchJobKeyData extends ValueObject<unknown> {
  private constructor(private readonly value: unknown) {
    super();
  }

  static fromPrimitives(value: unknown): JobMatchJobKeyData {
    return new JobMatchJobKeyData(value);
  }

  toPrimitives(): unknown {
    return this.value;
  }
}
