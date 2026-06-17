import { describe, expect, it } from "vitest";
import { DeleteCVDocumentStatus } from "./delete-cv-document-status.value-object";

describe("DeleteCVDocumentStatus", () => {
  it("builds a deleted status", () => {
    const status = DeleteCVDocumentStatus.deleted();

    expect(status.isDeleted()).toBe(true);
    expect(status.isInUse()).toBe(false);
    expect(status.isNotFound()).toBe(false);
    expect(status.toPrimitives()).toBe("deleted");
  });

  it("builds an in_use status", () => {
    const status = DeleteCVDocumentStatus.inUse();

    expect(status.isInUse()).toBe(true);
    expect(status.toPrimitives()).toBe("in_use");
  });

  it("builds a not_found status", () => {
    const status = DeleteCVDocumentStatus.notFound();

    expect(status.isNotFound()).toBe(true);
    expect(status.toPrimitives()).toBe("not_found");
  });

  it("round-trips through primitives", () => {
    expect(
      DeleteCVDocumentStatus.fromPrimitives("in_use").toPrimitives()
    ).toBe("in_use");
  });

  it("rejects an invalid status", () => {
    expect(() => DeleteCVDocumentStatus.fromPrimitives("nope")).toThrow(
      "Invalid delete CV document status"
    );
  });
});
