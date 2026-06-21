import { describe, expect, it } from "vitest";
import { CVPublicFeedback } from "./cv-public-feedback.entity";

describe("CVPublicFeedback", () => {
  it("hydrates public CV feedback", () => {
    const feedback = CVPublicFeedback.fromPrimitives({
      id: crypto.randomUUID(),
      cvId: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      giverName: null,
      giverContext: null,
      feedbackText: " Helpful note ",
      createdAt: new Date().toISOString(),
    });
    expect(feedback.toPrimitives().feedbackText).toBe("Helpful note");
  });
});
