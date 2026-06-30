import { describe, expect, it, vi } from "vitest";
import { opportunityPerson } from "./opportunity-person-test-helpers";
import { ListOpportunityPeopleForChatUseCase } from "./list-opportunity-people-for-chat.use-case";

describe("ListOpportunityPeopleForChatUseCase", () => {
  it("delegates opportunity-scoped person loading", async () => {
    const person = opportunityPerson();
    const listPeople = {
      execute: vi.fn(async () => [person]),
    };
    const useCase = new ListOpportunityPeopleForChatUseCase(
      listPeople as never,
    );

    const result = await useCase.execute({
      analysisId: "analysis-1",
      userId: "user-1",
    });

    expect(result).toEqual([person]);
    expect(listPeople.execute).toHaveBeenCalledWith({
      analysisId: "analysis-1",
      userId: "user-1",
    });
  });
});
