import { describe, expect, it } from "vitest";
import { Link } from "./link.value-object";

describe("Link", () => {
  it("normalizes an HTTP link and its optional label", () => {
    expect(
      Link.fromPrimitives({
        url: "  https://linkedin.com/in/marta  ",
        label: "  LinkedIn  ",
      }).toPrimitives(),
    ).toEqual({
      url: "https://linkedin.com/in/marta",
      label: "LinkedIn",
    });
  });

  it("keeps an omitted label as null", () => {
    expect(
      Link.fromPrimitives({
        url: "https://example.com/profile",
        label: null,
      }).toPrimitives(),
    ).toEqual({ url: "https://example.com/profile", label: null });
  });

  it.each(["not-a-url", "javascript:alert(1)", "ftp://example.com/file"])(
    "rejects an unsafe or invalid URL: %s",
    (url) => {
      expect(() => Link.fromPrimitives({ url, label: null })).toThrow(
        "URL must use HTTP or HTTPS",
      );
    },
  );
});
