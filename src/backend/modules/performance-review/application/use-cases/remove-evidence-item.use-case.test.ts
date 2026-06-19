import { describe, expect, it } from "vitest";
import { ExecutionResult } from "@/backend/modules/shared";
import { createTestUser } from "@/backend/modules/test-helpers/setup";
import {
  makePerformanceReviewDeps,
  seedReview,
} from "../../test-helpers/performance-review.fixture";
import { AddEvidenceItemUseCase } from "./add-evidence-item.use-case";
import { RemoveEvidenceItemUseCase } from "./remove-evidence-item.use-case";

describe("RemoveEvidenceItemUseCase", () => {
  it("removes an item and returns false for unknown ids", async () => {
    const user = await createTestUser("evidence-remove");
    const deps = makePerformanceReviewDeps();
    const review = await seedReview(deps, user.id);
    const item = await new AddEvidenceItemUseCase({
      reviewRepo: deps.reviewRepo,
      itemRepo: deps.itemRepo,
      eventBus: deps.eventBusPort,
    }).execute({
      reviewId: review.id,
      userId: user.id,
      source: "custom",
      content: "Removable",
    });

    const useCase = new RemoveEvidenceItemUseCase({
      itemRepo: deps.itemRepo,
      eventBus: deps.eventBusPort,
    });

    const deletedOk = await useCase.execute({ id: item.id, userId: user.id });
    expect(deletedOk).toBeInstanceOf(ExecutionResult);
    expect(deletedOk.toPrimitives()).toBe(true);

    const deletedFail = await useCase.execute({ id: crypto.randomUUID(), userId: user.id });
    expect(deletedFail).toBeInstanceOf(ExecutionResult);
    expect(deletedFail.toPrimitives()).toBe(false);
  });
});
