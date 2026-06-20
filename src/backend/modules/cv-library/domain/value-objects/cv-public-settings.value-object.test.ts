import { describe, expect, it } from "vitest";
import { CVPublicSettings } from "./cv-public-settings.value-object";

describe("CVPublicSettings", () => {
  it("round-trips primitives", () => {
    const primitives = {
      enabled: true,
      feedbackEnabled: true,
      publicId: "pub-1",
      slug: "my-cv",
      publishedAt: "2026-06-20T10:00:00.000Z",
    };
    expect(CVPublicSettings.fromPrimitives(primitives).toPrimitives()).toEqual(primitives);
  });

  it("defaults feedbackEnabled to false when absent", () => {
    const result = CVPublicSettings.fromPrimitives({
      enabled: false,
      publicId: null,
      slug: null,
      publishedAt: null,
    }).toPrimitives();
    expect(result.feedbackEnabled).toBe(false);
  });
});
