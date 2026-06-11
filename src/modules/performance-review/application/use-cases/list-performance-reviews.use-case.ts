import { UserId } from "@/modules/shared";
import type { PerformanceReview } from "../../domain/entities/performance-review.entity";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";

export class ListPerformanceReviewsUseCase {
  constructor(
    private readonly deps: { reviewRepo: PerformanceReviewRepository },
  ) {}

  async execute(userId: string): Promise<PerformanceReview[]> {
    return this.deps.reviewRepo.search({
      userId: UserId.fromPrimitives(userId),
    });
  }
}
