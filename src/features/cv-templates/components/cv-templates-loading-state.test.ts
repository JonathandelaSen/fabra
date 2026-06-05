import { describe, expect, it } from "vitest";
import { shouldShowCVTemplatesLoader } from "./cv-templates-loading-state";

describe("cv templates loading state", () => {
  it("keeps the screen on a loader while cv data is in flight", () => {
    expect(
      shouldShowCVTemplatesLoader({
        isResolvingCvs: true,
        pathname: "/templates/template-1",
        templateCount: 2,
        templateId: "template-1",
      })
    ).toBe(true);
  });

  it("keeps the screen on a loader while replacing /templates with the first template id", () => {
    expect(
      shouldShowCVTemplatesLoader({
        isResolvingCvs: false,
        pathname: "/templates",
        templateCount: 2,
        templateId: null,
      })
    ).toBe(true);
  });
});
