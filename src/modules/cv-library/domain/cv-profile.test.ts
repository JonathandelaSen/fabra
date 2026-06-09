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

  it("builds canonical platform links from a platform label and a bare handle", () => {
    const profile = normalizeStandardCVProfile({
      basics: {
        links: [
          { label: "LinkedIn", url: "diego-rodrigo-verdugo" },
          { label: "GitHub", url: "@JonathandelaSen" },
          { label: "X", url: "in/some-handle" },
        ],
      },
    });

    expect(profile.basics?.links).toEqual([
      {
        label: "LinkedIn/diego-rodrigo-verdugo",
        url: "https://www.linkedin.com/in/diego-rodrigo-verdugo/",
      },
      { label: "GitHub/JonathandelaSen", url: "https://github.com/JonathandelaSen" },
      { label: "X/some-handle", url: "https://x.com/some-handle" },
    ]);
  });

  it("normalizes the label from a domain url but keeps the url verbatim", () => {
    const profile = normalizeStandardCVProfile({
      basics: {
        links: [
          {
            label: "LinkedIn",
            url: "linkedin.com/in/jonathan-de-la-sen",
          },
        ],
      },
    });

    expect(profile.basics?.links?.[0]).toEqual({
      label: "LinkedIn/jonathan-de-la-sen",
      url: "linkedin.com/in/jonathan-de-la-sen",
    });
  });

  it("normalizes the label from a github domain url but keeps the url verbatim", () => {
    const profile = normalizeStandardCVProfile({
      basics: {
        links: [{ label: "GitHub", url: "github.com/JonathandelaSen" }],
      },
    });

    expect(profile.basics?.links?.[0]).toEqual({
      label: "GitHub/JonathandelaSen",
      url: "github.com/JonathandelaSen",
    });
  });

  it("normalizes the label from an x domain url but keeps the url verbatim", () => {
    const profile = normalizeStandardCVProfile({
      basics: {
        links: [{ label: "X", url: "x.com/jonathan_de_la_sen" }],
      },
    });

    expect(profile.basics?.links?.[0]).toEqual({
      label: "X/jonathan_de_la_sen",
      url: "x.com/jonathan_de_la_sen",
    });
  });

  it("leaves links whose label is itself a bare url untouched", () => {
    const profile = normalizeStandardCVProfile({
      basics: {
        links: [
          {
            label: "github.com/JonathandelaSen",
            url: "github.com/JonathandelaSen",
          },
        ],
      },
    });

    expect(profile.basics?.links?.[0]).toEqual({
      label: "github.com/JonathandelaSen",
      url: "github.com/JonathandelaSen",
    });
  });

  it("ignores bare handles when the platform label is unknown", () => {
    const profile = normalizeStandardCVProfile({
      basics: {
        links: [{ label: "Portfolio", url: "diego-rodrigo-verdugo" }],
      },
    });

    expect(profile.basics?.links?.[0]).toEqual({
      label: "Portfolio",
      url: "diego-rodrigo-verdugo",
    });
  });
});
