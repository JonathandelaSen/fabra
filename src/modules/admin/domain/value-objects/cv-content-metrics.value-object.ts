import { ValueObject } from "@/modules/shared";

export interface CVContentMetricsPrimitives {
  cvs: number;
  cvStructuredProfiles: number;
}

export class CVContentMetrics extends ValueObject<CVContentMetricsPrimitives> {
  private constructor(
    private readonly cvsCount: number,
    private readonly cvStructuredProfilesCount: number
  ) {
    super();
  }

  static fromPrimitives(primitives: CVContentMetricsPrimitives): CVContentMetrics {
    return new CVContentMetrics(primitives.cvs, primitives.cvStructuredProfiles);
  }

  toPrimitives(): CVContentMetricsPrimitives {
    return {
      cvs: this.cvsCount,
      cvStructuredProfiles: this.cvStructuredProfilesCount,
    };
  }

  get cvs(): number {
    return this.cvsCount;
  }

  get cvStructuredProfiles(): number {
    return this.cvStructuredProfilesCount;
  }
}
