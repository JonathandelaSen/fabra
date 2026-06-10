import { ValueObject } from "@/modules/shared";

export interface OpportunitiesContentMetricsPrimitives {
  jobOpportunities: number;
  processQuestions: number;
}

export class OpportunitiesContentMetrics extends ValueObject<OpportunitiesContentMetricsPrimitives> {
  private constructor(
    private readonly jobOpportunitiesCount: number,
    private readonly processQuestionsCount: number
  ) {
    super();
  }

  static fromPrimitives(primitives: OpportunitiesContentMetricsPrimitives): OpportunitiesContentMetrics {
    return new OpportunitiesContentMetrics(
      primitives.jobOpportunities,
      primitives.processQuestions
    );
  }

  toPrimitives(): OpportunitiesContentMetricsPrimitives {
    return {
      jobOpportunities: this.jobOpportunitiesCount,
      processQuestions: this.processQuestionsCount,
    };
  }

  get jobOpportunities(): number {
    return this.jobOpportunitiesCount;
  }

  get processQuestions(): number {
    return this.processQuestionsCount;
  }
}
