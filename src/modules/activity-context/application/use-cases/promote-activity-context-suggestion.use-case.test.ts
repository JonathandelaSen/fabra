import { describe, expect, it, vi } from "vitest";
import { PromoteActivityContextSuggestionUseCase } from "./promote-activity-context-suggestion.use-case";

describe("PromoteActivityContextSuggestionUseCase", () => {
  it("promotes a suggestion by creating a context and publishing events pulled from the created entity", async () => {
    const repo = {
      save: vi.fn(async (context) => context),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new PromoteActivityContextSuggestionUseCase({
      activityContextRepo: repo as never,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      type: "employment",
      name: "Acme",
    });

    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("activity_context_created");
    expect(result.toPrimitives()).toMatchObject({
      userId: "user-1",
      type: "employment",
      name: "Acme",
      status: "active",
      isDefault: false,
    });
  });
});
