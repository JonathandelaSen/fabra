import { describe, expect, it, vi } from "vitest";
import { documentRepo } from "./cv-library-test-helpers.test";
import { CreateUploadedCVDocumentUseCase } from "./create-uploaded-cv-document.use-case";

describe("CreateUploadedCVDocumentUseCase", () => {
  it("creates an uploaded document and publishes domain events", async () => {
    const repo = documentRepo();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const result = await new CreateUploadedCVDocumentUseCase({
      documentRepo: repo,
      eventBus: eventBus as never,
    }).execute({
      id: "cv-1",
      userId: "user-1",
      name: "CV",
      filename: "cv.pdf",
      fileSize: 10,
      pdfStoragePath: "user-1/cv.pdf",
      textPython: "text",
      textPdfjs: null,
      textNode: null,
      extractErrorPython: null,
      extractErrorPdfjs: null,
      extractErrorNode: null,
    });

    expect(result.toPrimitives()).toMatchObject({
      id: "cv-1",
      type: "uploaded",
    });
    expect(repo.save).toHaveBeenCalledOnce();
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe("cv_document_created");
    expect(publishedEvents[0].toPrimitives()).toEqual({
      documentId: "cv-1",
      type: "uploaded",
    });
  });
});
