import { describe, expect, it, vi } from "vitest";
import { structuredProfileRepo } from "./cv-library-test-helpers.test";
import { UpsertCVStructuredProfileUseCase } from "./upsert-cv-structured-profile.use-case";

describe("UpsertCVStructuredProfileUseCase", () => {
  it("upserts profile data and publishes domain events", async () => {
    const repo = structuredProfileRepo();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const result = await new UpsertCVStructuredProfileUseCase({
      profileRepo: repo,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      cvDocumentId: "cv-1",
      schemaVersion: "standard-v1",
      sourceTextHash: "hash-1",
      aiModel: "gemini",
      profile: { basics: { name: "Ada" } },
    });

    expect(result.toPrimitives()).toMatchObject({ cvDocumentId: "cv-1" });
    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_structured_profile_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      cvDocumentId: "cv-1",
      profileId: result.id,
    });
  });
});
