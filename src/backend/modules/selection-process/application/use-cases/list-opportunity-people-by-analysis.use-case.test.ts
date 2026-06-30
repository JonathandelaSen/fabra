import { describe, expect, it, vi } from "vitest";
import type { FollowUpRepository } from "../../domain/repositories/follow-up.repository";
import type { OpportunityPersonRepository } from "../../domain/repositories/opportunity-person.repository";
import { ListOpportunityPeopleByAnalysisUseCase } from "./list-opportunity-people-by-analysis.use-case";
import { followUp, opportunityPerson } from "./opportunity-person-test-helpers";

describe("ListOpportunityPeopleByAnalysisUseCase", () => {
  it("lists people belonging to the analysis opportunity", async () => {
    const person = opportunityPerson();
    const personRepo = {
      search: vi.fn(async () => [person]),
    } as unknown as OpportunityPersonRepository;
    const followUpRepo = {
      findBySourceJobMatchAnalysisId: vi.fn(async () => followUp()),
    } as unknown as FollowUpRepository;
    const useCase = new ListOpportunityPeopleByAnalysisUseCase({
      followUpRepo,
      personRepo,
    });

    const result = await useCase.execute({
      analysisId: "analysis-1",
      userId: "user-1",
    });

    expect(result).toEqual([person]);
    expect(personRepo.search).toHaveBeenCalledOnce();
    expect(personRepo.search).toHaveBeenCalledWith(
      expect.objectContaining({
        jobOpportunityIds: [expect.anything()],
        userId: expect.anything(),
      }),
    );
  });

  it("returns an empty list without creating tracking when no opportunity exists", async () => {
    const personRepo = {
      search: vi.fn(),
    } as unknown as OpportunityPersonRepository;
    const followUpRepo = {
      findBySourceJobMatchAnalysisId: vi.fn(async () => null),
    } as unknown as FollowUpRepository;
    const useCase = new ListOpportunityPeopleByAnalysisUseCase({
      followUpRepo,
      personRepo,
    });

    const result = await useCase.execute({
      analysisId: "missing",
      userId: "user-1",
    });

    expect(result).toEqual([]);
    expect(personRepo.search).not.toHaveBeenCalled();
  });
});
