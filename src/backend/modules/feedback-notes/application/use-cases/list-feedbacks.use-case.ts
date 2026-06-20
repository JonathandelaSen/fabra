import { UserId } from "@/backend/modules/shared";
import type { FeedbackStatus } from "../../domain/entities/feedback.entity";
import { Feedback } from "../../domain/entities/feedback.entity";
import type { FeedbackRepository } from "../../domain/repositories/feedback.repository";

export class ListFeedbacksUseCase {
  constructor(private readonly deps: { feedbackRepo: FeedbackRepository }) {}

  execute(userId: string, status: FeedbackStatus | "all" = "active"): Promise<Feedback[]> {
    return this.deps.feedbackRepo.list({ userId: UserId.fromPrimitives(userId), status });
  }
}
