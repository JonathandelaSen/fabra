import { ValueObject } from "@/modules/shared";

export interface ContentMetricsWindowPrimitives {
  since: string | null;
}

export class ContentMetricsWindow extends ValueObject<ContentMetricsWindowPrimitives> {
  private constructor(private readonly sinceDate: Date | null) {
    super();
  }

  static fromPrimitives(primitives: ContentMetricsWindowPrimitives): ContentMetricsWindow {
    return new ContentMetricsWindow(primitives.since ? new Date(primitives.since) : null);
  }

  toPrimitives(): ContentMetricsWindowPrimitives {
    return {
      since: this.sinceDate ? this.sinceDate.toISOString() : null,
    };
  }

  get since(): Date | null {
    return this.sinceDate;
  }
}
