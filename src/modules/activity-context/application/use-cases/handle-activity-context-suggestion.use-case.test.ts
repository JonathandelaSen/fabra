import { describe, expect, it, vi } from "vitest";
import { HandleActivityContextSuggestionUseCase } from "./handle-activity-context-suggestion.use-case";

describe("HandleActivityContextSuggestionUseCase", () => {
  it("hides a suggestion without creating a context", async () => {
    const repo = {
      hideSuggestion: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new HandleActivityContextSuggestionUseCase({
      activityContextRepo: repo as never,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      action: "hide",
      type: "employment",
      name: "Acme",
      roleOrLabel: "Lead",
    });

    expect(result).toEqual({ ok: true });
    expect(repo.hideSuggestion).toHaveBeenCalledOnce();
    expect(repo.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("promotes a suggestion by creating a context and publishing events", async () => {
    const repo = {
      hideSuggestion: vi.fn(),
      save: vi.fn(async (context) => context),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new HandleActivityContextSuggestionUseCase({
      activityContextRepo: repo as never,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      action: "promote",
      type: "employment",
      name: "Acme",
      roleOrLabel: "Lead",
    });

    expect(result).not.toEqual({ ok: true });
    expect(repo.hideSuggestion).not.toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("activity_context_created");
  });
});
