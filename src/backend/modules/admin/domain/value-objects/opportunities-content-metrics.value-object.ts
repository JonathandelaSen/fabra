import { Counter, ValueObject } from "@/backend/modules/shared";

export interface OpportunitiesContentMetricsPrimitives {
  jobOpportunities: number;
  processQuestions: number;
}

export class OpportunitiesContentMetrics extends ValueObject<OpportunitiesContentMetricsPrimitives> {
  private constructor(
    private readonly jobOpportunitiesCount: Counter,
    private readonly processQuestionsCount: Counter
  ) {
    super();
  }

  static fromPrimitives(primitives: OpportunitiesContentMetricsPrimitives): OpportunitiesContentMetrics {
    return new OpportunitiesContentMetrics(
      Counter.fromPrimitives(primitives.jobOpportunities),
      Counter.fromPrimitives(primitives.processQuestions)
    );
  }

  toPrimitives(): OpportunitiesContentMetricsPrimitives {
    return {
      jobOpportunities: this.jobOpportunitiesCount.toPrimitives(),
      processQuestions: this.processQuestionsCount.toPrimitives(),
    };
  }

  get jobOpportunities(): number {
    return this.jobOpportunitiesCount.toPrimitives();
  }

  get processQuestions(): number {
    return this.processQuestionsCount.toPrimitives();
  }
}
