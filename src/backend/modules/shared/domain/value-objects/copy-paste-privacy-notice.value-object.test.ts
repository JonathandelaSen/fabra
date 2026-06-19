import { describe, expect, it } from "vitest";
import { CopyPastePrivacyNotice } from "./copy-paste-privacy-notice.value-object";

describe("CopyPastePrivacyNotice", () => {
  it("allows null values", () => {
    const notice = CopyPastePrivacyNotice.fromPrimitives(null);
    expect(notice.toPrimitives()).toBeNull();
  });

  it("allows non-empty strings", () => {
    const notice = CopyPastePrivacyNotice.fromPrimitives("Please protect your data.");
    expect(notice.toPrimitives()).toBe("Please protect your data.");
  });

  it("trims whitespace from string values", () => {
    const notice = CopyPastePrivacyNotice.fromPrimitives("  Please protect your data.  ");
    expect(notice.toPrimitives()).toBe("Please protect your data.");
  });

  it("throws when empty string is provided", () => {
    expect(() => CopyPastePrivacyNotice.fromPrimitives("")).toThrow(
      "Copy paste privacy notice cannot be empty when present."
    );
  });

  it("throws when whitespace-only string is provided", () => {
    expect(() => CopyPastePrivacyNotice.fromPrimitives("   ")).toThrow(
      "Copy paste privacy notice cannot be empty when present."
    );
  });
});
