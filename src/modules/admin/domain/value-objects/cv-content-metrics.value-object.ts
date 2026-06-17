import { Counter, ValueObject } from "@/modules/shared";

export interface CVContentMetricsPrimitives {
  cvs: number;
  cvStructuredProfiles: number;
}

export class CVContentMetrics extends ValueObject<CVContentMetricsPrimitives> {
  private constructor(
    private readonly cvsCount: Counter,
    private readonly cvStructuredProfilesCount: Counter
  ) {
    super();
  }

  static fromPrimitives(primitives: CVContentMetricsPrimitives): CVContentMetrics {
    return new CVContentMetrics(
      Counter.fromPrimitives(primitives.cvs),
      Counter.fromPrimitives(primitives.cvStructuredProfiles)
    );
  }

  toPrimitives(): CVContentMetricsPrimitives {
    return {
      cvs: this.cvsCount.toPrimitives(),
      cvStructuredProfiles: this.cvStructuredProfilesCount.toPrimitives(),
    };
  }

  get cvs(): number {
    return this.cvsCount.toPrimitives();
  }

  get cvStructuredProfiles(): number {
    return this.cvStructuredProfilesCount.toPrimitives();
  }
}
