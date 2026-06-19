import { describe, expect, it } from "vitest";
import { CVDocumentReference } from "./cv-document-reference.value-object";

describe("CVDocumentReference", () => {
  it("round-trips a CV id", () => {
    expect(CVDocumentReference.fromPrimitives({ id: "cv-1" }).toPrimitives()).toEqual({ id: "cv-1" });
  });
});
