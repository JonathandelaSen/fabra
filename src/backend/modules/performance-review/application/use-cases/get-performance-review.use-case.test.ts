import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  reviewInput,
} from "../../test-helpers/performance-review.fixture";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import { CreatePerformanceReviewUseCase } from "./create-performance-review.use-case";
import { GetPerformanceReviewUseCase } from "./get-performance-review.use-case";

describe("GetPerformanceReviewUseCase", () => {
  it("returns a review by id", async () => {
    const user = await createTestUser("review-get");
    const deps = makePerformanceReviewDeps();
    const created = await new CreatePerformanceReviewUseCase({
      reviewRepo: deps.reviewRepo,
      eventBus: deps.eventBusPort,
    }).execute({ userId: user.id, ...reviewInput });

    const useCase = new GetPerformanceReviewUseCase({
      reviewRepo: deps.reviewRepo,
    });
    const review = await useCase.execute({ id: created.id, userId: user.id });
    expect(review.id).toBe(created.id);

    await expect(
      useCase.execute({ id: crypto.randomUUID(), userId: user.id }),
    ).rejects.toBeInstanceOf(PerformanceReviewNotFoundError);
  });
});
