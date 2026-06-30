import { describe, expect, it } from "vitest";
import { Link, LongText, Timestamp, UserId } from "@/backend/modules/shared";
import { createTestJobMatchAnalysis } from "@/backend/modules/test-helpers/analysis-fixtures";
import { createTestCV } from "@/backend/modules/test-helpers/cv-fixtures";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/backend/modules/test-helpers/setup";
import { OpportunityPerson } from "../../domain/entities/opportunity-person.entity";
import { JobOpportunityId } from "../../domain/value-objects/job-opportunity-id.value-object";
import { OpportunityPersonId } from "../../domain/value-objects/opportunity-person-id.value-object";
import { OpportunityPersonName } from "../../domain/value-objects/opportunity-person-name.value-object";
import { OpportunityPersonRole } from "../../domain/value-objects/opportunity-person-role.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";
import { SupabaseFollowUpRepository } from "./supabase-follow-up.repository";
import { SupabaseOpportunityPersonRepository } from "./supabase-opportunity-person.repository";

const supabase = getSupabaseClient();

describe("SupabaseOpportunityPersonRepository", () => {
  it("saves, finds, lists, updates, and deletes an opportunity person", async () => {
    const user = await createTestUser("selection-person");
    const cv = await createTestCV(supabase, {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: testLabel("cv"),
      filename: "cv.pdf",
      file_size: 100,
      pdf_storage_path: null,
    });
    const analysis = await createTestJobMatchAnalysis(supabase, {
      id: crypto.randomUUID(),
      userId: user.id,
      cvId: cv.id,
      title: "Opportunity with people",
      filename: "cv.pdf",
    });
    const followUpRepo = new SupabaseFollowUpRepository();
    const repo = new SupabaseOpportunityPersonRepository();
    followUpRepo.bindRequest(supabase);
    repo.bindRequest(supabase);
    const userId = UserId.fromPrimitives(user.id);
    const followUp = await followUpRepo.ensureBySourceJobMatchAnalysisId(
      SourceJobMatchAnalysisId.fromPrimitives(analysis.id),
      userId,
    );
    expect(followUp).not.toBeNull();
    const opportunityId = JobOpportunityId.fromPrimitives(
      followUp!.toPrimitives().jobOpportunityId,
    );
    const personId = OpportunityPersonId.fromPrimitives(crypto.randomUUID());
    const now = Timestamp.fromPrimitives("2026-06-30T09:00:00.000Z");
    const person = OpportunityPerson.create({
      id: personId,
      userId,
      jobOpportunityId: opportunityId,
      name: OpportunityPersonName.fromPrimitives("Marta García"),
      role: OpportunityPersonRole.fromPrimitives("hiring_manager"),
      jobTitle: LongText.fromPrimitives("Engineering Manager"),
      organization: LongText.fromPrimitives("Acme"),
      email: LongText.fromPrimitives("marta@example.com"),
      phone: null,
      links: [
        Link.fromPrimitives({
          url: "https://example.com/marta",
          label: null,
        }),
      ],
      notes: LongText.fromPrimitives("Owns the platform team."),
      createdAt: now,
      updatedAt: now,
    });

    const saved = await repo.save(person);
    expect(saved.toPrimitives()).toMatchObject({
      id: personId.toPrimitives(),
      name: "Marta García",
      role: "hiring_manager",
    });

    const found = await repo.findById(personId, userId);
    expect(found?.toPrimitives().links).toEqual([
      { url: "https://example.com/marta", label: null },
    ]);

    const listed = await repo.search({
      jobOpportunityIds: [opportunityId],
      userId,
    });
    expect(listed.map((item) => item.id)).toContain(personId.toPrimitives());

    saved.update({
      name: OpportunityPersonName.fromPrimitives("Marta G."),
      role: OpportunityPersonRole.fromPrimitives("potential_manager"),
      jobTitle: null,
      organization: null,
      email: null,
      phone: null,
      links: [],
      notes: null,
      updatedAt: Timestamp.fromPrimitives("2026-06-30T10:00:00.000Z"),
    });
    const updated = await repo.save(saved);
    expect(updated.toPrimitives()).toMatchObject({
      name: "Marta G.",
      role: "potential_manager",
      links: [],
    });

    expect((await repo.delete(personId, userId)).toPrimitives()).toBe(true);
    expect(await repo.findById(personId, userId)).toBeNull();
  });
});
