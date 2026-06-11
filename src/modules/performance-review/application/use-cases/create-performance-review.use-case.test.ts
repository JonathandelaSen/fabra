import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  reviewInput,
} from "../../test-helpers/performance-review.fixture";
import { CreatePerformanceReviewUseCase } from "./create-performance-review.use-case";

describe("CreatePerformanceReviewUseCase", () => {
  it("creates a draft review and publishes a created event", async () => {
    const user = await createTestUser("review-create");
    const { reviewRepo, eventBus, eventBusPort } = makePerformanceReviewDeps();

    const review = await new CreatePerformanceReviewUseCase({
      reviewRepo,
      eventBus: eventBusPort,
    }).execute({ userId: user.id, ...reviewInput });

    expect(review.toPrimitives()).toMatchObject({
      userId: user.id,
      title: reviewInput.title,
      status: "draft",
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const events = eventBus.publish.mock.calls[0][0];
    expect(events[0].eventName).toBe("performance_review_created");
  });
});
