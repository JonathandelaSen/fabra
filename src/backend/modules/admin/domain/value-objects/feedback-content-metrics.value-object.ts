import { Counter, ValueObject } from "@/backend/modules/shared";

export interface FeedbackContentMetricsPrimitives {
  feedbackNotesFeedbacks: number;
  receivedFeedback: number;
}

export class FeedbackContentMetrics extends ValueObject<FeedbackContentMetricsPrimitives> {
  private constructor(
    private readonly feedbackNotesFeedbacksCount: Counter,
    private readonly receivedFeedbackCount: Counter
  ) {
    super();
  }

  static fromPrimitives(primitives: FeedbackContentMetricsPrimitives): FeedbackContentMetrics {
    return new FeedbackContentMetrics(
      Counter.fromPrimitives(primitives.feedbackNotesFeedbacks),
      Counter.fromPrimitives(primitives.receivedFeedback)
    );
  }

  toPrimitives(): FeedbackContentMetricsPrimitives {
    return {
      feedbackNotesFeedbacks: this.feedbackNotesFeedbacksCount.toPrimitives(),
      receivedFeedback: this.receivedFeedbackCount.toPrimitives(),
    };
  }

  get feedbackNotesFeedbacks(): number {
    return this.feedbackNotesFeedbacksCount.toPrimitives();
  }

  get receivedFeedback(): number {
    return this.receivedFeedbackCount.toPrimitives();
  }
}
