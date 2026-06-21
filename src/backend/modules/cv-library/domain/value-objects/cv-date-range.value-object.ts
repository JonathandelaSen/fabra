import { BooleanFlag, LongText, ValueObject } from "@/backend/modules/shared";

export interface CVDateRangePrimitives {
  start?: string;
  end?: string;
  current?: boolean;
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

export class CVDateRange extends ValueObject<CVDateRangePrimitives> {
  private constructor(
    private readonly start?: LongText,
    private readonly end?: LongText,
    private readonly current?: BooleanFlag,
  ) {
    super();
  }

  static fromPrimitives(primitives: CVDateRangePrimitives): CVDateRange {
    return new CVDateRange(
      primitives.start === undefined
        ? undefined
        : LongText.fromPrimitives(primitives.start),
      primitives.end === undefined
        ? undefined
        : LongText.fromPrimitives(primitives.end),
      primitives.current === undefined
        ? undefined
        : BooleanFlag.fromPrimitives(primitives.current),
    );
  }

  toPrimitives(): CVDateRangePrimitives {
    return dropEmpty({
      start: this.start?.toPrimitives(),
      end: this.end?.toPrimitives(),
      current: this.current?.toPrimitives(),
    });
  }
}
