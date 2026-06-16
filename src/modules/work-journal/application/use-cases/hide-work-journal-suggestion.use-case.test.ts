import { describe, expect, it, vi } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
} from "@/modules/test-helpers/setup";
import { SupabaseWorkJournalContextRepository } from "../../infrastructure/repositories/supabase-work-journal-context.repository";
import { HideWorkJournalSuggestionUseCase } from "./hide-work-journal-suggestion.use-case";

const supabase = getSupabaseClient();

describe("HideWorkJournalSuggestionUseCase", () => {
  it("hides a suggestion and publishes no events", async () => {
    const user = await createTestUser("wj-suggestion-hide");
    const contextRepo = new SupabaseWorkJournalContextRepository();
    contextRepo.bindRequest(supabase);
    const useCase = new HideWorkJournalSuggestionUseCase({ contextRepo });

    await expect(
      useCase.execute({
        userId: user.id,
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
  });
});
