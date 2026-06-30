import { describe, expect, it, vi } from "vitest";
import { OpportunityPerson } from "../../domain/entities/opportunity-person.entity";
import { ListOpportunityPeopleForChatQuery } from "./list-opportunity-people-for-chat.query";
import { ListOpportunityPeopleForChatQueryHandler } from "./list-opportunity-people-for-chat.query-handler";

describe("ListOpportunityPeopleForChatQueryHandler", () => {
  it("projects only AI-safe profile fields", async () => {
    const person = OpportunityPerson.fromPrimitives({
      id: "person-1",
      userId: "user-1",
      jobOpportunityId: "job-1",
      name: "Marta García",
      role: "hiring_manager",
      jobTitle: "Engineering Manager",
      organization: "Acme",
      email: "marta@example.com",
      phone: "+34 600 000 000",
      links: [{ url: "https://example.com/marta", label: "Profile" }],
      notes: "Owns platform reliability.",
      createdAt: "2026-06-30T09:00:00.000Z",
      updatedAt: "2026-06-30T09:00:00.000Z",
    });
    const listPeople = {
      execute: vi.fn(async () => [person]),
    };
    const handler = new ListOpportunityPeopleForChatQueryHandler(
      listPeople as never,
    );

    const result = await handler.handle(
      new ListOpportunityPeopleForChatQuery({
        analysisId: "analysis-1",
        userId: "user-1",
      }),
    );

    expect(result).toEqual([
      {
        name: "Marta García",
        role: "hiring_manager",
        jobTitle: "Engineering Manager",
        organization: "Acme",
        links: [{ url: "https://example.com/marta", label: "Profile" }],
        notes: "Owns platform reliability.",
      },
    ]);
    expect(JSON.stringify(result)).not.toContain("marta@example.com");
    expect(JSON.stringify(result)).not.toContain("+34 600 000 000");
    expect(listPeople.execute).toHaveBeenCalledWith({
      analysisId: "analysis-1",
      userId: "user-1",
    });
  });
});
