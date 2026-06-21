import { describe, expect, it, vi } from "vitest";
import { document } from "./cv-library-test-helpers.test";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import { UpdateCVDocumentExtractionUseCase } from "./update-cv-document-extraction.use-case";

describe("UpdateCVDocumentExtractionUseCase", () => {
  it("updates extracted text and publishes domain events", async () => {
    const cv = document();
    const repo = {
      search: vi.fn(),
      findById: vi.fn(async () => cv),
      findPublishedByPublicId: vi.fn(),
      save: vi.fn(async (saved) => saved),
      delete: vi.fn(),
      deleteStoredPdf: vi.fn(),
    } satisfies CVDocumentRepository;
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const result = await new UpdateCVDocumentExtractionUseCase({
      documentRepo: repo,
      eventBus: eventBus as never,
    }).execute({
      id: "cv-1",
      userId: "user-1",
      extractedText: {
        textPython: "new text",
        textPdfjs: null,
        textNode: null,
        extractErrorPython: null,
        extractErrorPdfjs: null,
        extractErrorNode: null,
      },
    });

    expect(result?.toPrimitives().extractedText.textPython).toBe("new text");
    expect(eventBus.publish).toHaveBeenCalledOnce();
    const publishedEvents = eventBus.publish.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0].eventName).toBe(
      "cv_document_extracted_text_updated",
    );
    expect(publishedEvents[0].toPrimitives()).toEqual({
      documentId: "cv-1",
    });
  });
});
