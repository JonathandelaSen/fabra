import { describe, expect, it, vi } from "vitest";
import { documentRepo } from "./cv-library-test-helpers.test";
import { CreateTemplateCVDocumentUseCase } from "./create-template-cv-document.use-case";

describe("CreateTemplateCVDocumentUseCase", () => {
  it("creates a template document from profile data and publishes domain events", async () => {
    const repo = documentRepo();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const result = await new CreateTemplateCVDocumentUseCase({
      documentRepo: repo,
      eventBus: eventBus as never,
    }).execute({
      userId: "user-1",
      sourceCvId: "cv-source",
      name: "Template CV",
      templateId: "classic",
      templateLocale: "es",
      schemaVersion: "standard-v1",
      sourceTextHash: "hash",
      aiModel: "gemini",
      profile: { basics: { name: "Ada" } },
    });

    expect(result.toPrimitives()).toMatchObject({
      type: "template",
      sourceCvId: "cv-source",
      templateId: "classic",
    });
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_document_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      documentId: result.id,
      type: "template",
    });
  });
});
