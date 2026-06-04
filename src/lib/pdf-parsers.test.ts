import { readFile } from "fs/promises";
import { describe, expect, it } from "vitest";
import { extractWithPlainTextScanner } from "./pdf-parsers";

describe("extractWithPlainTextScanner", () => {
  it("extracts text from PDFs that pdf-parse returned empty for", async () => {
    const buffer = await readFile(".test-infra/fixtures/cvs/cv-jon-2026.pdf");

    const result = await extractWithPlainTextScanner(buffer);

    expect(result.text?.length).toBeGreaterThan(1000);
    expect(result.text).toContain("Jonathan de la Sen");
    expect(result.text).toContain("Senior Software Engineer");
  });
});
