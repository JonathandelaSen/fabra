import { OptionalTimestamp, ValueObject } from "@/backend/modules/shared";

export interface ContentMetricsWindowPrimitives {
  since: string | null;
}

export class ContentMetricsWindow extends ValueObject<ContentMetricsWindowPrimitives> {
  private constructor(private readonly sinceDate: OptionalTimestamp) {
    super();
  }

  static fromPrimitives(primitives: ContentMetricsWindowPrimitives): ContentMetricsWindow {
    return new ContentMetricsWindow(OptionalTimestamp.fromPrimitives(primitives.since));
  }

  toPrimitives(): ContentMetricsWindowPrimitives {
    return {
      since: this.sinceDate.toPrimitives(),
    };
  }

  get since(): Date | null {
    const since = this.sinceDate.toPrimitives();
    return since === null ? null : new Date(since);
  }
}
