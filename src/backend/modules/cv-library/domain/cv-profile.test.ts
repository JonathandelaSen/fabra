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

  it("keeps link labels and urls as plain text without forcing platform formats", () => {
    const profile = normalizeStandardCVProfile({
      basics: {
        links: [
          { label: "LinkedIn", url: "linkedin.com/in/jonathan-de-la-sen" },
          { label: "My profile", url: "github.com/JonathandelaSen" },
        ],
      },
    });

    expect(profile.basics?.links).toEqual([
      { label: "LinkedIn", url: "linkedin.com/in/jonathan-de-la-sen" },
      { label: "My profile", url: "github.com/JonathandelaSen" },
    ]);
  });
});

describe("cv profile stable ids", () => {
  it("adds stable ids to anchorable entries and bullets", () => {
    const profile = normalizeStandardCVProfile({
      experience: [{ company: "Fabra", bullets: ["Built the editor"] }],
      education: [{ institution: "University", details: ["Computer science"] }],
      projects: [{ name: "Public CV", bullets: ["Published it"] }],
    });

    expect(profile.experience?.[0]?.id).toMatch(/^[a-zA-Z0-9_-]{8}$/);
    expect(profile.experience?.[0]?.bullets?.[0]).toBe("Built the editor");
    expect(profile.experience?.[0]?.bulletIds?.[0]).toMatch(/^[a-zA-Z0-9_-]{8}$/);
    expect(profile.education?.[0]?.id).toMatch(/^[a-zA-Z0-9_-]{8}$/);
    expect(profile.education?.[0]?.details?.[0]).toBe("Computer science");
    expect(profile.education?.[0]?.detailIds?.[0]).toMatch(/^[a-zA-Z0-9_-]{8}$/);
    expect(profile.projects?.[0]?.id).toMatch(/^[a-zA-Z0-9_-]{8}$/);
  });

  it("preserves existing ids while normalizing text", () => {
    const profile = normalizeStandardCVProfile({
      experience: [{
        id: "exp_1234",
        company: " Fabra ",
        bullets: [" Shipped it "],
        bulletIds: ["bul_1234"],
      }],
    });

    expect(profile.experience?.[0]).toMatchObject({
      id: "exp_1234",
      company: "Fabra",
      bullets: ["Shipped it"],
      bulletIds: ["bul_1234"],
    });
  });

  it("gives duplicate entries and bullets distinct ids", () => {
    const profile = normalizeStandardCVProfile({
      experience: [
        { company: "Same", bullets: ["Same", "Same"] },
        { company: "Same", bullets: ["Same", "Same"] },
      ],
    });

    expect(profile.experience?.[0]?.id).not.toBe(profile.experience?.[1]?.id);
    expect(profile.experience?.[0]?.bulletIds?.[0]).not.toBe(
      profile.experience?.[0]?.bulletIds?.[1],
    );
  });
});
