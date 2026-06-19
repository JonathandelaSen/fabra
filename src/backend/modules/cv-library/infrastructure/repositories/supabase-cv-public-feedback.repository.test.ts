import { describe, expect, it } from "vitest";
import { createTestCV } from "@/modules/test-helpers/cv-fixtures";
import { createTestUser, getSupabaseClient } from "@/modules/test-helpers/setup";
import { SupabaseCVPublicFeedbackRepository } from "./supabase-cv-public-feedback.repository";
describe("SupabaseCVPublicFeedbackRepository", () => {
  it("lists and deletes owner feedback", async () => {
    const supabase = getSupabaseClient(); const user = await createTestUser("public-cv-feedback");
    const cv = await createTestCV(supabase, { id: crypto.randomUUID(), user_id: user.id, name: "Public CV", type: "template" });
    const { data, error } = await supabase.from("cv_public_feedback").insert({ cv_id: cv.id, user_id: user.id, feedback_text: "Useful feedback" }).select("id").single();
    if (error) throw error;
    const repo = new SupabaseCVPublicFeedbackRepository(); repo.bindRequest(supabase);
    await expect(repo.listForOwner(cv.id, user.id)).resolves.toHaveLength(1);
    await repo.deleteForOwner(data.id, user.id);
    await expect(repo.listForOwner(cv.id, user.id)).resolves.toHaveLength(0);
  });
});
