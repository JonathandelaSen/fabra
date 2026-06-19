import { describe, expect, it } from "vitest";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  reviewInput,
} from "../../test-helpers/performance-review.fixture";
import { CreatePerformanceReviewUseCase } from "./create-performance-review.use-case";
import { UpdatePerformanceReviewUseCase } from "./update-performance-review.use-case";

describe("UpdatePerformanceReviewUseCase", () => {
  it("updates details and can mark the review completed", async () => {
    const user = await createTestUser("review-update");
    const deps = makePerformanceReviewDeps();
    const created = await new CreatePerformanceReviewUseCase({
      reviewRepo: deps.reviewRepo,
      eventBus: deps.eventBusPort,
    }).execute({ userId: user.id, ...reviewInput });

    const updated = await new UpdatePerformanceReviewUseCase({
      reviewRepo: deps.reviewRepo,
      eventBus: deps.eventBusPort,
    }).execute({
      id: created.id,
      userId: user.id,
      title: "Updated title",
      complete: true,
    });

    expect(updated.toPrimitives()).toMatchObject({
      title: "Updated title",
      status: "completed",
    });
  });
});
