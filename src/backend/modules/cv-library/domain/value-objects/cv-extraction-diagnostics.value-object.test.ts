import { describe, expect, it } from "vitest";
import { CVExtractionDiagnostics } from "./cv-extraction-diagnostics.value-object";

describe("CVExtractionDiagnostics", () => {
  it("round-trips full diagnostics", () => {
    const primitives = {
      filename: "cv.pdf",
      fileSize: 1024,
      pythonLength: 500,
      pdfjsLength: 480,
      nodeLength: 0,
      pythonError: false,
      pdfjsError: false,
      nodeError: true,
    };
    expect(
      CVExtractionDiagnostics.fromPrimitives(primitives).toPrimitives(),
    ).toEqual(primitives);
  });

  it("supports null filename and fileSize", () => {
    const primitives = {
      filename: null,
      fileSize: null,
      pythonLength: 0,
      pdfjsLength: 0,
      nodeLength: 0,
      pythonError: true,
      pdfjsError: true,
      nodeError: true,
    };
    expect(
      CVExtractionDiagnostics.fromPrimitives(primitives).toPrimitives(),
    ).toEqual(primitives);
  });
});
