import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  reviewInput,
} from "../../test-helpers/performance-review.fixture";
import { CreatePerformanceReviewUseCase } from "./create-performance-review.use-case";
import { DeletePerformanceReviewUseCase } from "./delete-performance-review.use-case";

describe("DeletePerformanceReviewUseCase", () => {
  it("deletes an existing review and returns false for unknown ids", async () => {
    const user = await createTestUser("review-delete");
    const deps = makePerformanceReviewDeps();
    const created = await new CreatePerformanceReviewUseCase({
      reviewRepo: deps.reviewRepo,
      eventBus: deps.eventBusPort,
    }).execute({ userId: user.id, ...reviewInput });

    const useCase = new DeletePerformanceReviewUseCase({
      reviewRepo: deps.reviewRepo,
      eventBus: deps.eventBusPort,
    });

    expect(await useCase.execute({ id: created.id, userId: user.id })).toBe(
      true,
    );
    expect(
      await useCase.execute({ id: crypto.randomUUID(), userId: user.id }),
    ).toBe(false);
  });
});
