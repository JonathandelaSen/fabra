import { describe, expect, it, vi } from "vitest";
import { documentRepo } from "./cv-library-test-helpers.test";
import { UpdateCVDocumentNameUseCase } from "./update-cv-document-name.use-case";

describe("UpdateCVDocumentNameUseCase", () => {
  it("renames an existing document and publishes domain events", async () => {
    const repo = documentRepo();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const result = await new UpdateCVDocumentNameUseCase({
      documentRepo: repo,
      eventBus: eventBus as never,
    }).execute({ id: "cv-1", userId: "user-1", name: "Updated" });

    expect(result?.toPrimitives().name).toBe("Updated");
    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_document_renamed");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      documentId: "cv-1",
    });
  });
});
