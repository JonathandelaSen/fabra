import { ValueObject } from "@/modules/shared";

export interface AnalysisContentMetricsPrimitives {
  jobMatchAnalyses: number;
  analysisChatConversations: number;
  analysisChatMessages: number;
  interviewQuestions: number;
}

export class AnalysisContentMetrics extends ValueObject<AnalysisContentMetricsPrimitives> {
  private constructor(
    private readonly jobMatchAnalysesCount: number,
    private readonly analysisChatConversationsCount: number,
    private readonly analysisChatMessagesCount: number,
    private readonly interviewQuestionsCount: number
  ) {
    super();
  }

  static fromPrimitives(primitives: AnalysisContentMetricsPrimitives): AnalysisContentMetrics {
    return new AnalysisContentMetrics(
      primitives.jobMatchAnalyses,
      primitives.analysisChatConversations,
      primitives.analysisChatMessages,
      primitives.interviewQuestions
    );
  }

  toPrimitives(): AnalysisContentMetricsPrimitives {
    return {
      jobMatchAnalyses: this.jobMatchAnalysesCount,
      analysisChatConversations: this.analysisChatConversationsCount,
      analysisChatMessages: this.analysisChatMessagesCount,
      interviewQuestions: this.interviewQuestionsCount,
    };
  }

  get jobMatchAnalyses(): number {
    return this.jobMatchAnalysesCount;
  }

  get analysisChatConversations(): number {
    return this.analysisChatConversationsCount;
  }

  get analysisChatMessages(): number {
    return this.analysisChatMessagesCount;
  }

  get interviewQuestions(): number {
    return this.interviewQuestionsCount;
  }
}
