import { UserId } from "@/modules/shared";
import type { PerformanceReview } from "../../domain/entities/performance-review.entity";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";

export interface GetPerformanceReviewInput {
  id: string;
  userId: string;
}

export class GetPerformanceReviewUseCase {
  constructor(
    private readonly deps: { reviewRepo: PerformanceReviewRepository },
  ) {}

  async execute(input: GetPerformanceReviewInput): Promise<PerformanceReview> {
    const review = await this.deps.reviewRepo.findById(
      PerformanceReviewId.fromPrimitives(input.id),
      UserId.fromPrimitives(input.userId),
    );
    if (!review) throw new PerformanceReviewNotFoundError();
    return review;
  }
}
