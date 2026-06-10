import { describe, expect, it, vi } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
} from "@/modules/test-helpers/setup";
import { SupabaseWorkJournalContextRepository } from "../../infrastructure/repositories/supabase-work-journal-context.repository";
import { HandleSuggestionActionUseCase } from "./handle-suggestion-action.use-case";

const supabase = getSupabaseClient();

describe("HandleSuggestionActionUseCase", () => {
  it("promotes a suggestion into a CV-created context and publishes domain events", async () => {
    const user = await createTestUser("wj-suggestion-promote");
    const contextRepo = new SupabaseWorkJournalContextRepository();
    contextRepo.bindRequest(supabase);
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new HandleSuggestionActionUseCase({ contextRepo, eventBus: eventBus as never });

    const context = await useCase.execute({
      userId: user.id,
      action: "promote",
      type: "employment",
      name: "Acme",
      role_or_label: "Engineer",
      is_default: true,
    });

    if ("ok" in context) throw new Error("Expected promoted suggestion to return a context.");

    expect(context.toPrimitives()).toMatchObject({
      userId: user.id,
      type: "employment",
      name: "Acme",
      roleOrLabel: null,
      isDefault: false,
    });

    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("work_journal_context_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      contextId: context.id,
    });
  });

  it("hides a suggestion and publishes no events", async () => {
    const user = await createTestUser("wj-suggestion-hide");
    const contextRepo = new SupabaseWorkJournalContextRepository();
    contextRepo.bindRequest(supabase);
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new HandleSuggestionActionUseCase({ contextRepo, eventBus: eventBus as never });

    await expect(
      useCase.execute({
        userId: user.id,
        action: "hide",
        type: "project",
        name: "Internal Tools",
        role_or_label: null,
      })
    ).resolves.toEqual({ ok: true });

    await expect(
      contextRepo
        .listHiddenSuggestionKeys(user.id)
        .then((keys) => new Set(Array.from(keys).map((key) => key.toPrimitives())))
    ).resolves.toEqual(new Set(["project:internal tools"]));
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
