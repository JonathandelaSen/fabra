import { describe, expect, it, vi } from "vitest";
import { document, documentRepo } from "./cv-library-test-helpers.test";
import { UpdateCVDocumentPublicSettingsUseCase } from "./update-cv-document-public-settings.use-case";

describe("UpdateCVDocumentPublicSettingsUseCase", () => {
  it("updates public settings for template documents and publishes domain events", async () => {
    const repo = documentRepo({ findById: async () => document({ type: "template" }) });
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const result = await new UpdateCVDocumentPublicSettingsUseCase({
      documentRepo: repo,
      eventBus: eventBus as never,
    }).execute({
      id: "cv-1",
      userId: "user-1",
      publicEnabled: true,
      publicId: "pub-1",
      publicSlug: "ada-cv",
    });

    expect(result?.toPrimitives().publicSettings).toMatchObject({
      enabled: true,
      publicId: "pub-1",
      slug: "ada-cv",
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_document_published");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      documentId: "cv-1",
      slug: "ada-cv",
    });
  });
});
