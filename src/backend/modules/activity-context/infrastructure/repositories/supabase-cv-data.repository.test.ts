import { describe, expect, it } from "vitest";
import { createTestCV } from "@/modules/test-helpers/cv-fixtures";
import {
  createTestUser,
  getSupabaseClient,
  testLabel,
} from "@/modules/test-helpers/setup";
import { SupabaseCVDataRepository } from "./supabase-cv-data.repository";

const supabase = getSupabaseClient();

describe("SupabaseCVDataRepository", () => {
  it("can be constructed without a Supabase client", () => {
    expect(new SupabaseCVDataRepository()).toBeInstanceOf(SupabaseCVDataRepository);
  });

  it("uses structured profiles for uploaded CVs when the CV row has no template profile", async () => {
    const user = await createTestUser("activity-context-cv-data");
    const repo = new SupabaseCVDataRepository();
    repo.bindRequest(supabase);
    const cv = await createTestCV(supabase, {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: testLabel("uploaded-cv"),
      type: "uploaded",
      profile: null,
    });
    const profile = {
      personalInfo: {},
      experience: [
        { company: "Structured Corp", role: "Staff Engineer", dates: { start: "", end: "", current: true }, bullets: [] },
      ],
      education: [],
      skills: [],
      languages: [],
      projects: [],
      certifications: [],
      publications: [],
      volunteering: [],
    };

    const { error } = await supabase.from("cv_structured_profiles").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      cv_id: cv.id,
      schema_version: "standard-v1",
      source_text_hash: "hash-activity-context",
      ai_model: "mock",
      profile,
    });
    if (error) throw error;

    await expect(repo.listCVs(user.id)).resolves.toMatchObject([
      {
        type: "uploaded",
        profile: {
          experience: [{ company: "Structured Corp", role: "Staff Engineer" }],
        },
      },
    ]);
  });
});
