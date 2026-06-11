import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
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

    expect(await useCase.execute({ id: item.id, userId: user.id })).toBe(true);
    expect(
      await useCase.execute({ id: crypto.randomUUID(), userId: user.id }),
    ).toBe(false);
  });
});
