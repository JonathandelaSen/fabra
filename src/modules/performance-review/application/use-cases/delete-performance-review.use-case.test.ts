import { describe, expect, it } from "vitest";
import { ExecutionResult } from "@/modules/shared";
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

    const deletedOk = await useCase.execute({ id: created.id, userId: user.id });
    expect(deletedOk).toBeInstanceOf(ExecutionResult);
    expect(deletedOk.toPrimitives()).toBe(true);

    const deletedFail = await useCase.execute({ id: crypto.randomUUID(), userId: user.id });
    expect(deletedFail).toBeInstanceOf(ExecutionResult);
    expect(deletedFail.toPrimitives()).toBe(false);
  });
});
