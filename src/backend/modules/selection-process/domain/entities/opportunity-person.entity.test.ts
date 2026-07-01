import { describe, expect, it } from "vitest";
import { Link, LongText, Timestamp, UserId } from "@/backend/modules/shared";
import { OpportunityPerson } from "./opportunity-person.entity";
import { OpportunityPersonId } from "../value-objects/opportunity-person-id.value-object";
import { OpportunityPersonName } from "../value-objects/opportunity-person-name.value-object";
import { OpportunityPersonRole } from "../value-objects/opportunity-person-role.value-object";
import { JobOpportunityId } from "../value-objects/job-opportunity-id.value-object";

const now = "2026-06-30T09:00:00.000Z";

function createPerson() {
  return OpportunityPerson.create({
    id: OpportunityPersonId.fromPrimitives("person-1"),
    userId: UserId.fromPrimitives("user-1"),
    jobOpportunityId: JobOpportunityId.fromPrimitives("job-1"),
    name: OpportunityPersonName.fromPrimitives("Marta García"),
    role: OpportunityPersonRole.fromPrimitives("hiring_manager"),
    jobTitle: LongText.fromPrimitives("Engineering Manager"),
    organization: LongText.fromPrimitives("Acme"),
    email: LongText.fromPrimitives("marta@example.com"),
    phone: LongText.fromPrimitives("+34 600 000 000"),
    links: [
      Link.fromPrimitives({
        url: "https://linkedin.com/in/marta",
        label: "LinkedIn",
      }),
      Link.fromPrimitives({
        url: "www.asd.com",
        label: "Schemeless URL",
      }),
    ],
    notes: LongText.fromPrimitives("Interested in platform reliability."),
    createdAt: Timestamp.fromPrimitives(now),
    updatedAt: Timestamp.fromPrimitives(now),
  });
}

describe("OpportunityPerson", () => {
  it("creates and serializes an opportunity-scoped profile", () => {
    const person = createPerson();

    expect(person.toPrimitives()).toEqual({
      id: "person-1",
      userId: "user-1",
      jobOpportunityId: "job-1",
      name: "Marta García",
      role: "hiring_manager",
      jobTitle: "Engineering Manager",
      organization: "Acme",
      email: "marta@example.com",
      phone: "+34 600 000 000",
      links: [
        { url: "https://linkedin.com/in/marta", label: "LinkedIn" },
        { url: "www.asd.com", label: "Schemeless URL" },
      ],
      notes: "Interested in platform reliability.",
      createdAt: now,
      updatedAt: now,
    });
    expect(person.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "opportunity_person_created",
    ]);
  });

  it("hydrates without recording events", () => {
    const hydrated = OpportunityPerson.fromPrimitives(
      createPerson().toPrimitives(),
    );

    expect(hydrated.pullDomainEvents()).toEqual([]);
  });

  it("updates all editable profile fields", () => {
    const person = createPerson();
    person.pullDomainEvents();

    person.update({
      name: OpportunityPersonName.fromPrimitives("Marta G."),
      role: OpportunityPersonRole.fromPrimitives("potential_manager"),
      jobTitle: LongText.fromPrimitives("Director of Engineering"),
      organization: null,
      email: null,
      phone: null,
      links: [],
      notes: LongText.fromPrimitives("Follow up about team structure."),
      updatedAt: Timestamp.fromPrimitives("2026-06-30T10:00:00.000Z"),
    });

    expect(person.toPrimitives()).toMatchObject({
      name: "Marta G.",
      role: "potential_manager",
      jobTitle: "Director of Engineering",
      organization: null,
      email: null,
      phone: null,
      links: [],
      notes: "Follow up about team structure.",
      updatedAt: "2026-06-30T10:00:00.000Z",
    });
    expect(person.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "opportunity_person_updated",
    ]);
  });

  it("records deletion", () => {
    const person = createPerson();
    person.pullDomainEvents();

    person.delete();

    expect(person.pullDomainEvents().map((event) => event.eventName)).toEqual([
      "opportunity_person_deleted",
    ]);
  });
});
