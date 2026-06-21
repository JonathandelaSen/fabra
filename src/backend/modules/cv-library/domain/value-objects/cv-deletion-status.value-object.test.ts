import { describe, expect, it } from "vitest";
import { CVDeletionStatus } from "./cv-deletion-status.value-object";

describe("CVDeletionStatus", () => {
  it("builds a deleted status", () => {
    const status = CVDeletionStatus.deleted();

    expect(status.isDeleted()).toBe(true);
    expect(status.isInUse()).toBe(false);
    expect(status.isNotFound()).toBe(false);
    expect(status.toPrimitives()).toBe("deleted");
  });

  it("builds an in_use status", () => {
    const status = CVDeletionStatus.inUse();

    expect(status.isInUse()).toBe(true);
    expect(status.toPrimitives()).toBe("in_use");
  });

  it("builds a not_found status", () => {
    const status = CVDeletionStatus.notFound();

    expect(status.isNotFound()).toBe(true);
    expect(status.toPrimitives()).toBe("not_found");
  });

  it("round-trips through primitives", () => {
    expect(CVDeletionStatus.fromPrimitives("in_use").toPrimitives()).toBe(
      "in_use",
    );
  });

  it("rejects an invalid status", () => {
    expect(() => CVDeletionStatus.fromPrimitives("nope")).toThrow(
      "Invalid delete CV document status",
    );
  });
});
