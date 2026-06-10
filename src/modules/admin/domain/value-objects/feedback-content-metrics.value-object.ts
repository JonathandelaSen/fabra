import { ValueObject } from "@/modules/shared";

export interface FeedbackContentMetricsPrimitives {
  feedbackNotesFeedbacks: number;
  receivedFeedback: number;
}

export class FeedbackContentMetrics extends ValueObject<FeedbackContentMetricsPrimitives> {
  private constructor(
    private readonly feedbackNotesFeedbacksCount: number,
    private readonly receivedFeedbackCount: number
  ) {
    super();
  }

  static fromPrimitives(primitives: FeedbackContentMetricsPrimitives): FeedbackContentMetrics {
    return new FeedbackContentMetrics(
      primitives.feedbackNotesFeedbacks,
      primitives.receivedFeedback
    );
  }

  toPrimitives(): FeedbackContentMetricsPrimitives {
    return {
      feedbackNotesFeedbacks: this.feedbackNotesFeedbacksCount,
      receivedFeedback: this.receivedFeedbackCount,
    };
  }

  get feedbackNotesFeedbacks(): number {
    return this.feedbackNotesFeedbacksCount;
  }

  get receivedFeedback(): number {
    return this.receivedFeedbackCount;
  }
}
