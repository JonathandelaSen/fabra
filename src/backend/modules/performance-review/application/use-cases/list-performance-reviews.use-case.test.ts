import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  reviewInput,
} from "../../test-helpers/performance-review.fixture";
import { CreatePerformanceReviewUseCase } from "./create-performance-review.use-case";
import { ListPerformanceReviewsUseCase } from "./list-performance-reviews.use-case";

describe("ListPerformanceReviewsUseCase", () => {
  it("lists the user's reviews", async () => {
    const user = await createTestUser("review-list");
    const deps = makePerformanceReviewDeps();
    await new CreatePerformanceReviewUseCase({
      reviewRepo: deps.reviewRepo,
      eventBus: deps.eventBusPort,
    }).execute({ userId: user.id, ...reviewInput });

    const reviews = await new ListPerformanceReviewsUseCase({
      reviewRepo: deps.reviewRepo,
    }).execute(user.id);

    expect(reviews.length).toBeGreaterThanOrEqual(1);
    expect(reviews.every((r) => r.userId === user.id)).toBe(true);
  });
});
