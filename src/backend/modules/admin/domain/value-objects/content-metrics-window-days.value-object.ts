import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";
export class InvalidContentMetricsWindowDaysError extends DomainError {
  constructor(value: number) { super(ErrorCode.INVALID_CONTENT_METRICS_WINDOW_DAYS, `Window days cannot be negative: ${value}`, { value }); this.name = "InvalidContentMetricsWindowDaysError"; }
}

export class ContentMetricsWindowDays extends ValueObject<number | null> {
  private constructor(private readonly value: number | null) {
    super();
    if (value !== null && value < 0) {
      throw new InvalidContentMetricsWindowDaysError(value);
    }
  }

  static fromPrimitives(value: number | null): ContentMetricsWindowDays {
    return new ContentMetricsWindowDays(value);
  }

  toPrimitives(): number | null {
    return this.value;
  }
}
