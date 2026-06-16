import { describe, expect, it, vi } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
} from "@/modules/test-helpers/setup";
import { SupabaseWorkJournalContextRepository } from "../../infrastructure/repositories/supabase-work-journal-context.repository";
import { PromoteWorkJournalSuggestionUseCase } from "./promote-work-journal-suggestion.use-case";

const supabase = getSupabaseClient();

describe("PromoteWorkJournalSuggestionUseCase", () => {
  it("promotes a suggestion into a CV-created context and publishes domain events", async () => {
    const user = await createTestUser("wj-suggestion-promote");
    const contextRepo = new SupabaseWorkJournalContextRepository();
    contextRepo.bindRequest(supabase);
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const useCase = new PromoteWorkJournalSuggestionUseCase({ contextRepo, eventBus: eventBus as never });

    const context = await useCase.execute({
      userId: user.id,
      type: "employment",
      name: "Acme",
      role_or_label: "Engineer",
    });

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
});
