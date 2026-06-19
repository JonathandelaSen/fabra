import { Counter, ValueObject } from "@/backend/modules/shared";

export interface AnalysisContentMetricsPrimitives {
  jobMatchAnalyses: number;
  analysisChatConversations: number;
  analysisChatMessages: number;
  interviewQuestions: number;
}

export class AnalysisContentMetrics extends ValueObject<AnalysisContentMetricsPrimitives> {
  private constructor(
    private readonly jobMatchAnalysesCount: Counter,
    private readonly analysisChatConversationsCount: Counter,
    private readonly analysisChatMessagesCount: Counter,
    private readonly interviewQuestionsCount: Counter
  ) {
    super();
  }

  static fromPrimitives(primitives: AnalysisContentMetricsPrimitives): AnalysisContentMetrics {
    return new AnalysisContentMetrics(
      Counter.fromPrimitives(primitives.jobMatchAnalyses),
      Counter.fromPrimitives(primitives.analysisChatConversations),
      Counter.fromPrimitives(primitives.analysisChatMessages),
      Counter.fromPrimitives(primitives.interviewQuestions)
    );
  }

  toPrimitives(): AnalysisContentMetricsPrimitives {
    return {
      jobMatchAnalyses: this.jobMatchAnalysesCount.toPrimitives(),
      analysisChatConversations: this.analysisChatConversationsCount.toPrimitives(),
      analysisChatMessages: this.analysisChatMessagesCount.toPrimitives(),
      interviewQuestions: this.interviewQuestionsCount.toPrimitives(),
    };
  }

  get jobMatchAnalyses(): number {
    return this.jobMatchAnalysesCount.toPrimitives();
  }

  get analysisChatConversations(): number {
    return this.analysisChatConversationsCount.toPrimitives();
  }

  get analysisChatMessages(): number {
    return this.analysisChatMessagesCount.toPrimitives();
  }

  get interviewQuestions(): number {
    return this.interviewQuestionsCount.toPrimitives();
  }
}
