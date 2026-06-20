import { describe, expect, it, vi } from "vitest";
import { ExecutionResult } from "@/backend/modules/shared";
import { HideActivityContextSuggestionUseCase } from "./hide-activity-context-suggestion.use-case";

describe("HideActivityContextSuggestionUseCase", () => {
  it("hides a suggestion without creating a context", async () => {
    const repo = {
      hideSuggestion: vi.fn().mockResolvedValue(undefined),
    };

    const result = await new HideActivityContextSuggestionUseCase({
      activityContextRepo: repo as never,
    }).execute({
      userId: "user-1",
      type: "employment",
      name: "Acme",
    });

    expect(result).toBeInstanceOf(ExecutionResult);
    expect(result.toPrimitives()).toBe(true);
    expect(repo.hideSuggestion).toHaveBeenCalledOnce();
    expect(repo.hideSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({ value: "user-1" }),
      expect.objectContaining({
        suggestionName: expect.objectContaining({ value: "Acme" }),
        suggestionType: expect.objectContaining({ value: "employment" }),
      })
    );
  });
});
