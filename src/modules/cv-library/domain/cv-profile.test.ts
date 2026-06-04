import { describe, expect, it } from "vitest";
import {
  buildExternalLinkHref,
  normalizeContactEmail,
  normalizeStandardCVProfile,
} from "./cv-profile";

describe("cv profile contact normalization", () => {
  it("normalizes markdown and mailto email values to a raw email address", () => {
    expect(normalizeContactEmail("[jonathandelasen@gmail.com](mailto:jonathandelasen@gmail.com)")).toBe(
      "jonathandelasen@gmail.com",
    );
    expect(normalizeContactEmail("mailto:jonathandelasen@gmail.com")).toBe(
      "jonathandelasen@gmail.com",
    );
  });

  it("keeps bare link labels and builds clickable hrefs for rendering", () => {
    const profile = normalizeStandardCVProfile({
      basics: {
        email: "[jonathandelasen@gmail.com](mailto:jonathandelasen@gmail.com)",
        links: [{ label: "github.com/JonathandelaSen", url: "github.com/JonathandelaSen" }],
      },
      projects: [{ name: "Clipscribe", url: "github.com/JonathandelaSen/clipscribe" }],
    });

    expect(profile.basics?.email).toBe("jonathandelasen@gmail.com");
    expect(profile.basics?.links?.[0]).toEqual({
      label: "github.com/JonathandelaSen",
      url: "github.com/JonathandelaSen",
    });
    expect(profile.projects?.[0]?.url).toBe("github.com/JonathandelaSen/clipscribe");
    expect(buildExternalLinkHref(profile.basics?.links?.[0]?.url ?? "")).toBe(
      "https://github.com/JonathandelaSen",
    );
  });
});
