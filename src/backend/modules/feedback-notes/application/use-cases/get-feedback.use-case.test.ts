import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import {
  createDefaultContext,
  createFeedbackFixture,
  makeFeedbackDeps,
} from "../../test-helpers";
import { GetFeedbackUseCase } from "./get-feedback.use-case";

describe("GetFeedbackUseCase", () => {
  it("gets owned feedback by id", async () => {
    const user = await createTestUser("feedback-get");
    const { feedbackRepo } = makeFeedbackDeps();
    const context = await createDefaultContext(user.id);
    const feedback = await createFeedbackFixture(user.id, context.id);

    const result = await new GetFeedbackUseCase({ feedbackRepo }).execute(
      user.id,
      feedback.id,
    );

    expect(result.toPrimitives()).toMatchObject({
      id: feedback.id,
      user_id: user.id,
    });
  });
});
