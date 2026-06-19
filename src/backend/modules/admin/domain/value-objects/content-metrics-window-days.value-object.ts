import { ValueObject } from "@/backend/modules/shared";

export class ContentMetricsWindowDays extends ValueObject<number | null> {
  private constructor(private readonly value: number | null) {
    super();
    if (value !== null && value < 0) {
      throw new Error("Window days cannot be negative.");
    }
  }

  static fromPrimitives(value: number | null): ContentMetricsWindowDays {
    return new ContentMetricsWindowDays(value);
  }

  toPrimitives(): number | null {
    return this.value;
  }
}
