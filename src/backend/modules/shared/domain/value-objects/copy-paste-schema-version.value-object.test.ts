import { describe, expect, it } from "vitest";
import { CopyPasteSchemaVersion } from "./copy-paste-schema-version.value-object";

describe("CopyPasteSchemaVersion", () => {
  it("allows non-empty strings", () => {
    const version = CopyPasteSchemaVersion.fromPrimitives("1");
    expect(version.toPrimitives()).toBe("1");
  });

  it("trims whitespace from string values", () => {
    const version = CopyPasteSchemaVersion.fromPrimitives("  1  ");
    expect(version.toPrimitives()).toBe("1");
  });

  it("throws when empty string is provided", () => {
    expect(() => CopyPasteSchemaVersion.fromPrimitives("")).toThrow(
      "Copy paste schemaVersion cannot be empty."
    );
  });

  it("throws when whitespace-only string is provided", () => {
    expect(() => CopyPasteSchemaVersion.fromPrimitives("   ")).toThrow(
      "Copy paste schemaVersion cannot be empty."
    );
  });
});
