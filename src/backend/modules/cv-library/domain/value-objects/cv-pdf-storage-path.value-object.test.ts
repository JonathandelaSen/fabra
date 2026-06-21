import { describe, expect, it } from "vitest";
import { CVPdfStoragePath } from "./cv-pdf-storage-path.value-object";

describe("CVPdfStoragePath", () => {
  it("round-trips primitives", () => {
    expect(
      CVPdfStoragePath.fromPrimitives("user-1/cv.pdf").toPrimitives(),
    ).toBe("user-1/cv.pdf");
  });

  it("rejects blank values", () => {
    expect(() => CVPdfStoragePath.fromPrimitives(" ")).toThrow("empty");
  });
});
