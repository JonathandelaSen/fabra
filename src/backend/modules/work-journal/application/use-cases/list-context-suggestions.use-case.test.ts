import { describe, expect, it } from "vitest";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/backend/modules/test-helpers/setup";
import type { CVDataRepository } from "../../domain/repositories/cv-data.repository";
import { CVSummaryForSuggestions } from "../../domain/value-objects/cv-summary-for-suggestions.value-object";
import { SupabaseWorkJournalContextRepository } from "../../infrastructure/repositories/supabase-work-journal-context.repository";
import { ListContextSuggestionsUseCase } from "./list-context-suggestions.use-case";

const supabase = getSupabaseClient();

describe("ListContextSuggestionsUseCase", () => {
  it("suggests CV contexts while excluding existing and hidden contexts", async () => {
    const user = await createTestUser("wj-list-suggestions");
    const contextRepo = new SupabaseWorkJournalContextRepository();
    contextRepo.bindRequest(supabase);
    await contextRepo.create({
      user_id: user.id,
      type: "employment",
      name: "Existing Company",
    });
    await contextRepo.hideSuggestion(user.id, {
      type: "project",
      name: "Hidden Project",
    });
    const cvDataRepo: CVDataRepository = {
      async listCVs() {
        return [
          CVSummaryForSuggestions.fromPrimitives({
            type: "template",
            profile: {
              basics: { name: testLabel("candidate") },
              experience: [
                { company: "Existing Company", role: "Engineer" },
                {
                  company: "Suggested Company",
                  role: "Lead",
                  dates: { current: true },
                },
              ],
              projects: [
                { name: "Hidden Project" },
                { name: "Visible Project", organization: "Lab" },
              ],
            } as any,
          }),
          CVSummaryForSuggestions.fromPrimitives({
            type: "uploaded",
            profile: {
              experience: [{ company: "Ignored Upload", role: "Engineer" }],
            } as any,
          }),
        ];
      },
    };
    const useCase = new ListContextSuggestionsUseCase({ contextRepo, cvDataRepo });

    const result = await useCase.execute(user.id);

    expect(result.map((suggestion) => suggestion.toPrimitives())).toEqual([
      expect.objectContaining({
        type: "employment",
        name: "Suggested Company",
        roleOrLabel: "Lead",
        isCurrent: true,
      }),
      expect.objectContaining({
        type: "project",
        name: "Visible Project",
        roleOrLabel: "Lab",
      }),
    ]);
  });
});
