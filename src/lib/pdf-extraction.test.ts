import { readFile } from "fs/promises";
import { describe, expect, it } from "vitest";
import { extractPdfText } from "./pdf-extraction";

describe("extractPdfText", () => {
  it("produces text from the in-process node and pdfjs extractors", async () => {
    const buffer = await readFile(".test-infra/fixtures/cvs/cv-jon-2026.pdf");

    const result = await extractPdfText(buffer);

    expect(result.extract_error_node).toBeNull();
    expect(result.text_node?.length ?? 0).toBeGreaterThan(1000);
    expect(result.text_node).toContain("Jonathan de la Sen");

    expect(result.extract_error_pdfjs).toBeNull();
    expect(result.text_pdfjs?.length ?? 0).toBeGreaterThan(1000);
    expect(result.text_pdfjs).toContain("Jonathan de la Sen");
  });

  it("degrades gracefully when the python parser cannot run in-process", async () => {
    const buffer = await readFile(".test-infra/fixtures/cvs/cv-jon-2026.pdf");

    const result = await extractPdfText(buffer);

    expect(result.text_python).toBeNull();
    expect(result.extract_error_python).not.toBeNull();
  });
});
