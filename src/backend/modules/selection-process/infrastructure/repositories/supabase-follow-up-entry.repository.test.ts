import { describe, expect, it } from "vitest";
import {
  LongText,
  OptionalTimestamp,
  Timestamp,
  UserId,
} from "@/backend/modules/shared";
import { createTestJobMatchAnalysis } from "@/backend/modules/test-helpers/analysis-fixtures";
import { createTestCV } from "@/backend/modules/test-helpers/cv-fixtures";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/backend/modules/test-helpers/setup";
import { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import { FollowUpEntryId } from "../../domain/value-objects/follow-up-entry-id.value-object";
import { FollowUpId } from "../../domain/value-objects/follow-up-id.value-object";
import { FollowUpStatus } from "../../domain/value-objects/follow-up-status.value-object";
import { SourceJobMatchAnalysisId } from "../../domain/value-objects/source-job-match-analysis-id.value-object";
import { SupabaseFollowUpEntryRepository } from "./supabase-follow-up-entry.repository";
import { SupabaseFollowUpRepository } from "./supabase-follow-up.repository";

const supabase = getSupabaseClient();

describe("SupabaseFollowUpEntryRepository", () => {
  it("persists history and atomically updates current status only on insert", async () => {
    const user = await createTestUser("selection-follow-up-entry");
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
      title: "Offer",
      filename: "cv.pdf",
    });
    const followUpRepo = new SupabaseFollowUpRepository();
    const entryRepo = new SupabaseFollowUpEntryRepository();
    followUpRepo.bindRequest(supabase);
    entryRepo.bindRequest(supabase);
    const userId = UserId.fromPrimitives(user.id);
    const analysisId = SourceJobMatchAnalysisId.fromPrimitives(analysis.id);
    const followUp = await followUpRepo.ensureBySourceJobMatchAnalysisId(
      analysisId,
      userId,
    );
    expect(followUp).not.toBeNull();
    const now = "2026-06-29T10:00:00.000Z";
    const entry = FollowUpEntry.create({
      id: FollowUpEntryId.fromPrimitives(crypto.randomUUID()),
      userId,
      followUpId: FollowUpId.fromPrimitives(followUp!.id),
      status: FollowUpStatus.fromPrimitives("applied"),
      title: LongText.fromPrimitives("Application sent"),
      notes: null,
      nextAction: LongText.fromPrimitives("Wait for recruiter"),
      nextActionAt: OptionalTimestamp.fromPrimitives(
        "2026-07-03T09:00:00.000Z",
      ),
      updatesCurrentStatus: true,
      occurredAt: Timestamp.fromPrimitives(now),
      createdAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives(now),
    });

    const saved = await entryRepo.save(entry);
    const afterInsert = await followUpRepo.findBySourceJobMatchAnalysisId(
      analysisId,
      userId,
    );
    expect(afterInsert?.toPrimitives().status).toBe("applied");

    saved.update({
      status: FollowUpStatus.fromPrimitives("interview"),
      title: LongText.fromPrimitives("Corrected historical entry"),
      notes: null,
      nextAction: null,
      nextActionAt: OptionalTimestamp.fromPrimitives(null),
      updatesCurrentStatus: true,
      occurredAt: Timestamp.fromPrimitives(now),
      updatedAt: Timestamp.fromPrimitives("2026-06-29T11:00:00.000Z"),
    });
    await entryRepo.save(saved);

    const afterEdit = await followUpRepo.findBySourceJobMatchAnalysisId(
      analysisId,
      userId,
    );
    expect(afterEdit?.toPrimitives().status).toBe("applied");
    const found = await entryRepo.findById(
      FollowUpEntryId.fromPrimitives(saved.id),
      userId,
    );
    expect(found?.toPrimitives().status).toBe("interview");
    const history = await entryRepo.search({
      followUpIds: [FollowUpId.fromPrimitives(followUp!.id)],
      userId,
    });
    expect(history.map((item) => item.id)).toContain(saved.id);

    expect(
      (
        await entryRepo.delete(
          FollowUpEntryId.fromPrimitives(saved.id),
          userId,
        )
      ).toPrimitives(),
    ).toBe(true);
  });
});
