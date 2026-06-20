import { describe, expect, it } from "vitest";
import { createTestCV } from "@/backend/modules/test-helpers/cv-fixtures";
import { createTestUser, getSupabaseClient } from "@/backend/modules/test-helpers/setup";
import { UserId } from "@/backend/modules/shared";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVPublicFeedbackId } from "../../domain/value-objects/cv-public-feedback-id.value-object";
import { SupabaseCVPublicFeedbackRepository } from "./supabase-cv-public-feedback.repository";
describe("SupabaseCVPublicFeedbackRepository", () => {
  it("lists and deletes owner feedback", async () => {
    const supabase = getSupabaseClient(); const user = await createTestUser("public-cv-feedback");
    const cv = await createTestCV(supabase, { id: crypto.randomUUID(), user_id: user.id, name: "Public CV", type: "template" });
    const { data, error } = await supabase.from("cv_public_feedback").insert({ cv_id: cv.id, user_id: user.id, feedback_text: "Useful feedback" }).select("id").single();
    if (error) throw error;
    const repo = new SupabaseCVPublicFeedbackRepository(); repo.bindRequest(supabase);
    const cvId = CVDocumentId.fromPrimitives(cv.id);
    const userId = UserId.fromPrimitives(user.id);
    await expect(repo.listForOwner(cvId, userId)).resolves.toHaveLength(1);
    await repo.deleteForOwner(CVPublicFeedbackId.fromPrimitives(data.id), userId);
    await expect(repo.listForOwner(cvId, userId)).resolves.toHaveLength(0);
  });
});
