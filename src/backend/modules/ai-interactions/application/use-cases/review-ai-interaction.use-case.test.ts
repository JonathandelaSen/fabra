import { describe, expect, it, vi } from "vitest";
import { ReviewAIInteractionUseCase } from "./review-ai-interaction.use-case";

describe("ReviewAIInteractionUseCase", () => {
  it("saves a review aggregate", async () => {
    const repository = { save: vi.fn(async (review) => review), searchByReviewer: vi.fn() };
    const result = await new ReviewAIInteractionUseCase({ repository }).execute({
      interactionId: "interaction-1", reviewerUserId: "user-1", rating: "good", note: null,
    });
    expect(result.toPrimitives().rating).toBe("good");
  });
});
