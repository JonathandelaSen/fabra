import { readFile } from "fs/promises";
import { describe, expect, it } from "vitest";
import { PdfTextExtractionService } from "./pdf-text-extraction.service";
import { PdfParsersService } from "./pdf-parsers.service";

describe("PdfTextExtractionService", () => {
  it("produces text from the in-process node and pdfjs extractors", async () => {
    const buffer = await readFile(".test-infra/fixtures/cvs/cv-jon-2026.pdf");
    const service = new PdfTextExtractionService(new PdfParsersService());

    const result = await service.extract(buffer, {
      userId: "user-1",
      cvId: "cv-1",
      requestId: "request-1",
    });
    const primitives = result.toPrimitives();

    expect(primitives.extractErrorNode).toBeNull();
    expect(primitives.textNode?.length ?? 0).toBeGreaterThan(1000);
    expect(primitives.textNode).toContain("Jonathan de la Sen");

    expect(primitives.extractErrorPdfjs).toBeNull();
    expect(primitives.textPdfjs?.length ?? 0).toBeGreaterThan(1000);
    expect(primitives.textPdfjs).toContain("Jonathan de la Sen");
  });

  it("degrades gracefully when the python parser cannot run in-process", async () => {
    const buffer = await readFile(".test-infra/fixtures/cvs/cv-jon-2026.pdf");
    const service = new PdfTextExtractionService(new PdfParsersService());

    const result = await service.extract(buffer, {
      userId: "user-1",
      cvId: "cv-1",
      requestId: "request-1",
    });
    const primitives = result.toPrimitives();

    expect(primitives.textPython).toBeNull();
    expect(primitives.extractErrorPython).not.toBeNull();
  });
});
