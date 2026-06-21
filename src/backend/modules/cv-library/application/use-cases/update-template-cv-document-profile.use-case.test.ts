import { describe, expect, it, vi } from "vitest";
import { document, documentRepo } from "./cv-library-test-helpers.test";
import { UpdateTemplateCVDocumentProfileUseCase } from "./update-template-cv-document-profile.use-case";

describe("UpdateTemplateCVDocumentProfileUseCase", () => {
  it("updates profile data only for template documents and publishes domain events", async () => {
    const repo = documentRepo({
      findById: async () => document({ type: "template" }),
    });
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const result = await new UpdateTemplateCVDocumentProfileUseCase({
      documentRepo: repo,
      eventBus: eventBus as never,
    }).execute({
      id: "cv-1",
      userId: "user-1",
      name: "Template",
      profile: { basics: { name: "Ada" } },
      templateLocale: "en",
    });

    expect(result?.toPrimitives()).toMatchObject({
      name: "Template",
      profile: { basics: { name: "Ada" } },
      templateLocale: "en",
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_document_profile_updated");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      documentId: "cv-1",
    });
  });
});
