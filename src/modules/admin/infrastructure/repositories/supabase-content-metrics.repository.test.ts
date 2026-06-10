import { describe, expect, it } from "vitest";
import { createTestUser } from "@/modules/test-helpers/setup";
import { createAdminClient } from "@/lib/supabase/admin";
import { SupabaseContentMetricsRepository } from "./supabase-content-metrics.repository";

const repo = new SupabaseContentMetricsRepository();

describe("SupabaseContentMetricsRepository", () => {
  it("returns counts >= 0 for all methods with a null window", async () => {
    const cvCounts = await repo.countCVContent({ since: null });
    expect(cvCounts.cvs).toBeGreaterThanOrEqual(0);
    expect(cvCounts.cvStructuredProfiles).toBeGreaterThanOrEqual(0);

    const analysisCounts = await repo.countAnalysisContent({ since: null });
    expect(analysisCounts.jobMatchAnalyses).toBeGreaterThanOrEqual(0);
    expect(analysisCounts.analysisChatConversations).toBeGreaterThanOrEqual(0);
    expect(analysisCounts.analysisChatMessages).toBeGreaterThanOrEqual(0);
    expect(analysisCounts.interviewQuestions).toBeGreaterThanOrEqual(0);

    const oppCounts = await repo.countOpportunitiesContent({ since: null });
    expect(oppCounts.jobOpportunities).toBeGreaterThanOrEqual(0);
    expect(oppCounts.processQuestions).toBeGreaterThanOrEqual(0);

    const feedbackCounts = await repo.countFeedbackContent({ since: null });
    expect(feedbackCounts.feedbackNotesFeedbacks).toBeGreaterThanOrEqual(0);
    expect(feedbackCounts.receivedFeedback).toBeGreaterThanOrEqual(0);

    const workspaceCounts = await repo.countWorkspaceContent({ since: null });
    expect(workspaceCounts.workJournalEntries).toBeGreaterThanOrEqual(0);
    expect(workspaceCounts.commitments).toBeGreaterThanOrEqual(0);
    expect(workspaceCounts.activityContexts).toBeGreaterThanOrEqual(0);
  });

  it("includes a newly inserted row with since: null and recent since, and excludes it with future since", async () => {
    const user = await createTestUser(`admin-metrics-${Date.now()}`);
    const admin = createAdminClient();

    // Get counts before
    const beforeGlobal = await repo.countCVContent({ since: null });

    // Insert a known row
    const id = crypto.randomUUID();
    const { error } = await admin.from("cvs").insert({
      id,
      user_id: user.id,
      name: "Test CV for Admin Metrics",
      type: "uploaded",
    });
    expect(error).toBeNull();

    // Get counts after
    const afterGlobal = await repo.countCVContent({ since: null });
    expect(afterGlobal.cvs - beforeGlobal.cvs).toBe(1);

    // Test with recent since (e.g. 1 day ago)
    const recentSince = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCounts = await repo.countCVContent({ since: recentSince });
    expect(recentCounts.cvs).toBeGreaterThanOrEqual(1);

    // Test with future since (e.g. 1 day in the future)
    const futureSince = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const futureCounts = await repo.countCVContent({ since: futureSince });
    // The newly inserted row shouldn't be here, but other tests might be inserting in parallel, 
    // though future timestamps shouldn't exist unless explicitly set. We can expect it to be 0 or at least not contain our row.
    // Wait, the test stack is shared. Someone else could insert a row right now, but with 'now()' it won't be > futureSince.
    expect(futureCounts.cvs).toBe(0);
  });

  it("counts are global: rows from other users are included", async () => {
    const userA = await createTestUser(`admin-metrics-a-${Date.now()}`);
    const userB = await createTestUser(`admin-metrics-b-${Date.now()}`);
    const admin = createAdminClient();

    const beforeGlobal = await repo.countCVContent({ since: null });

    const idA = crypto.randomUUID();
    await admin.from("cvs").insert({ id: idA, user_id: userA.id, name: "CV A", type: "uploaded" });
    
    const idB = crypto.randomUUID();
    await admin.from("cvs").insert({ id: idB, user_id: userB.id, name: "CV B", type: "uploaded" });

    const afterGlobal = await repo.countCVContent({ since: null });
    expect(afterGlobal.cvs - beforeGlobal.cvs).toBe(2);
  });
});
