import { readFile } from "fs/promises";
import { describe, expect, it } from "vitest";
import { PdfParsersService } from "./pdf-parsers.service";

describe("PdfParsersService", () => {
  it("extracts text from PDFs that pdf-parse returned empty for", async () => {
    const buffer = await readFile(".test-infra/fixtures/cvs/cv-jon-2026.pdf");
    const service = new PdfParsersService();

    const result = await service.extract(buffer);
    const primitives = result.toPrimitives();

    expect(primitives.textNode?.length).toBeGreaterThan(1000);
    expect(primitives.textNode).toContain("Jonathan de la Sen");
    expect(primitives.textNode).toContain("Senior Software Engineer");
  });
});
