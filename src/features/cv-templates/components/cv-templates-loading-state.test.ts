import { describe, expect, it } from "vitest";
import {
  resolveActiveTemplateId,
  shouldShowCVTemplatesLoader,
} from "./cv-templates-loading-state";

describe("resolveActiveTemplateId", () => {
  const known = ["compact", "classic", "modern", "filo"];

  it("returns the template id when the path points at a known template", () => {
    expect(resolveActiveTemplateId("/templates/modern", known)).toBe("modern");
  });

  it("returns null on the bare /templates route (nothing selected yet)", () => {
    expect(resolveActiveTemplateId("/templates", known)).toBe(null);
  });

  it("regression: returns null while the pathname still belongs to the previous page (the view mounts before router.push updates the URL, so the stale segment is not a template id)", () => {
    expect(resolveActiveTemplateId("/job-analyses/abc123", known)).toBe(null);
  });

  it("returns null for an unknown template segment so the empty state never shows for a bogus id", () => {
    expect(resolveActiveTemplateId("/templates/does-not-exist", known)).toBe(null);
  });
});

describe("cv templates loading state", () => {
  it("keeps the screen on a loader while the cv data is initially loading", () => {
    expect(
      shouldShowCVTemplatesLoader({
        isCvsPending: true,
        pathname: "/templates/template-1",
        templateCount: 2,
        templateId: "template-1",
      })
    ).toBe(true);
  });

  it("does not flash the loader during a background cv refetch", () => {
    expect(
      shouldShowCVTemplatesLoader({
        isCvsPending: false,
        pathname: "/templates/template-1",
        templateCount: 2,
        templateId: "template-1",
      })
    ).toBe(false);
  });

  it("keeps the screen on a loader while replacing /templates with the first template id", () => {
    expect(
      shouldShowCVTemplatesLoader({
        isCvsPending: false,
        pathname: "/templates",
        templateCount: 2,
        templateId: null,
      })
    ).toBe(true);
  });

  it("regression: keeps the loader on during the route handoff when the URL already moved to a template but the local selection still lags (templates exist, nothing selected)", () => {
    expect(
      shouldShowCVTemplatesLoader({
        isCvsPending: false,
        pathname: "/templates/template-1",
        templateCount: 2,
        templateId: null,
      })
    ).toBe(true);
  });
});
