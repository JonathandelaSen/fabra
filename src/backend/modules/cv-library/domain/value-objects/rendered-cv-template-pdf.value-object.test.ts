import { describe, expect, it } from "vitest";
import { RenderedCVTemplatePdf } from "./rendered-cv-template-pdf.value-object";

describe("RenderedCVTemplatePdf", () => {
  it("wraps and exposes the rendered pdf bytes", () => {
    const bytes = Buffer.from("%PDF-1.7 fake");
    const rendered = RenderedCVTemplatePdf.fromPrimitives(bytes);
    expect(rendered.toPrimitives()).toBe(bytes);
  });
});
