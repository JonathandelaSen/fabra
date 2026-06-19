import { describe, expect, it } from "vitest";
import { AIInteractionReview } from "./ai-interaction-review.entity";

describe("AIInteractionReview", () => {
  it("serializes its primitives", () => {
    const review = AIInteractionReview.create({
      interactionId: "interaction-1", reviewerUserId: "user-1", rating: "good",
      note: "Strong", createdAt: "2026-06-13T10:00:00.000Z", updatedAt: "2026-06-13T10:00:00.000Z",
    });
    expect(review.toPrimitives().rating).toBe("good");
  });
});
