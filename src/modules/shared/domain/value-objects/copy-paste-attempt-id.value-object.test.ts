import { describe, expect, it } from "vitest";
import { CopyPasteAttemptId } from "./copy-paste-attempt-id.value-object";

describe("CopyPasteAttemptId", () => {
  it("allows null values", () => {
    const id = CopyPasteAttemptId.fromPrimitives(null);
    expect(id.toPrimitives()).toBeNull();
  });

  it("allows non-empty strings", () => {
    const id = CopyPasteAttemptId.fromPrimitives("attempt-123");
    expect(id.toPrimitives()).toBe("attempt-123");
  });

  it("trims whitespace from string values", () => {
    const id = CopyPasteAttemptId.fromPrimitives("  attempt-123  ");
    expect(id.toPrimitives()).toBe("attempt-123");
  });

  it("throws when empty string is provided", () => {
    expect(() => CopyPasteAttemptId.fromPrimitives("")).toThrow(
      "Copy paste attemptId cannot be empty when present."
    );
  });

  it("throws when whitespace-only string is provided", () => {
    expect(() => CopyPasteAttemptId.fromPrimitives("   ")).toThrow(
      "Copy paste attemptId cannot be empty when present."
    );
  });
});
