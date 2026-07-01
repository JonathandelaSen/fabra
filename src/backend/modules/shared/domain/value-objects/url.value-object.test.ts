import { describe, expect, it } from "vitest";
import { Url } from "./url.value-object";

describe("Url", () => {
  it("trims and preserves an HTTP or HTTPS URL", () => {
    expect(
      Url.fromPrimitives("  https://linkedin.com/in/marta  ").toPrimitives(),
    ).toBe("https://linkedin.com/in/marta");
  });

  it("allows and preserves schemeless URLs like www.asd.com and asd.com", () => {
    expect(Url.fromPrimitives("www.asd.com").toPrimitives()).toBe("www.asd.com");
    expect(Url.fromPrimitives("asd.com").toPrimitives()).toBe("asd.com");
  });

  it.each(["not-a-url", "javascript:alert(1)", "ftp://example.com/file", "", ".example.com", "example.com."])(
    "rejects an unsafe or invalid URL: %s",
    (value) => {
      expect(() => Url.fromPrimitives(value)).toThrow(
        "URL must use HTTP or HTTPS",
      );
    },
  );
});
