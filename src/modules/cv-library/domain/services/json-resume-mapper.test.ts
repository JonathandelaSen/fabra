import { describe, it, expect } from "vitest";
import { mapJsonResumeToProfile } from "./json-resume-mapper";
import { JsonResumeValidationError } from "../errors/json-resume-validation.error";

const MINIMAL_RESUME = {
  basics: { name: "John Doe" },
};

const FULL_RESUME = {
  basics: {
    name: "Jane Smith",
    label: "Software Engineer",
    email: "jane@example.com",
    phone: "+1-555-0100",
    url: "https://jane.dev",
    summary: "Experienced developer with 10 years in web technologies.",
    location: {
      city: "San Francisco",
      region: "CA",
      countryCode: "US",
    },
    profiles: [
      { network: "LinkedIn", url: "https://linkedin.com/in/jane" },
      { network: "GitHub", url: "https://github.com/jane" },
    ],
  },
  work: [
    {
      name: "Acme Corp",
      position: "Senior Developer",
      location: "Remote",
      startDate: "2020-01-01",
      endDate: "2024-06-01",
      highlights: ["Led team of 5", "Shipped v2.0"],
    },
    {
      name: "StartupXYZ",
      position: "Developer",
      startDate: "2017-03-01",
    },
  ],
  education: [
    {
      institution: "MIT",
      studyType: "BSc",
      area: "Computer Science",
      startDate: "2013-09-01",
      endDate: "2017-06-01",
      courses: ["Algorithms", "Distributed Systems"],
    },
  ],
  skills: [
    { name: "Frontend", keywords: ["React", "TypeScript", "CSS"] },
    { name: "Backend", keywords: ["Node.js", "PostgreSQL"] },
  ],
  languages: [
    { language: "English", fluency: "Native" },
    { language: "Spanish", fluency: "Intermediate" },
  ],
  certificates: [
    { name: "AWS Solutions Architect", issuer: "Amazon", date: "2022-05-01", url: "https://aws.cert" },
  ],
  projects: [
    { name: "OpenLib", description: "Open source library", highlights: ["1k stars"], url: "https://openlib.dev", startDate: "2021-01-01" },
  ],
  volunteer: [
    { organization: "Code.org", position: "Mentor", summary: "Teaching kids to code", highlights: ["50 students"], startDate: "2019-01-01" },
  ],
  awards: [
    { title: "Best Hack", awarder: "HackConf", date: "2020-11-01", summary: "Won first place" },
  ],
  publications: [
    { name: "Scaling Node.js", publisher: "O'Reilly", releaseDate: "2023-03-01", url: "https://oreilly.com/scaling", summary: "Book on scaling" },
  ],
  interests: [{ name: "Rock climbing" }],
  references: [{ name: "Bob", reference: "Great developer" }],
};

describe("mapJsonResumeToProfile", () => {
  describe("validation", () => {
    it("throws on null input", () => {
      expect(() => mapJsonResumeToProfile(null)).toThrow(JsonResumeValidationError);
    });

    it("throws on array input", () => {
      expect(() => mapJsonResumeToProfile([])).toThrow(JsonResumeValidationError);
    });

    it("throws on string input", () => {
      expect(() => mapJsonResumeToProfile("hello")).toThrow(JsonResumeValidationError);
    });

    it("throws when basics.name is missing", () => {
      expect(() => mapJsonResumeToProfile({ basics: {} })).toThrow(JsonResumeValidationError);
    });

    it("throws when basics is missing entirely", () => {
      expect(() => mapJsonResumeToProfile({})).toThrow(JsonResumeValidationError);
    });

    it("throws when basics.name is empty string", () => {
      expect(() => mapJsonResumeToProfile({ basics: { name: "  " } })).toThrow(JsonResumeValidationError);
    });
  });

  describe("minimal resume", () => {
    it("maps with only basics.name", () => {
      const { profile, warnings } = mapJsonResumeToProfile(MINIMAL_RESUME);
      expect(profile.basics?.name).toBe("John Doe");
      expect(warnings).toContain("No work experience found");
      expect(warnings).toContain("No education found");
      expect(warnings).toContain("No skills found");
    });
  });

  describe("full resume mapping", () => {
    it("maps basics correctly", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.basics?.name).toBe("Jane Smith");
      expect(profile.basics?.headline).toBe("Software Engineer");
      expect(profile.basics?.email).toBe("jane@example.com");
      expect(profile.basics?.phone).toBe("+1-555-0100");
      expect(profile.basics?.location).toBe("San Francisco, CA, US");
      expect(profile.basics?.links).toHaveLength(3);
      expect(profile.basics?.links?.[0]).toEqual({ url: "https://jane.dev", label: "Website" });
      expect(profile.basics?.links?.[1]).toEqual({ url: "https://linkedin.com/in/jane", label: "LinkedIn" });
    });

    it("maps summary from basics.summary", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.summary).toBe("Experienced developer with 10 years in web technologies.");
    });

    it("maps work to experience", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.experience).toHaveLength(2);
      expect(profile.experience?.[0]).toMatchObject({
        company: "Acme Corp",
        role: "Senior Developer",
        location: "Remote",
        bullets: ["Led team of 5", "Shipped v2.0"],
      });
      expect(profile.experience?.[0]?.dates?.start).toBe("2020-01-01");
      expect(profile.experience?.[0]?.dates?.end).toBe("2024-06-01");
      expect(profile.experience?.[1]?.dates?.current).toBe(true);
    });

    it("maps education", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.education).toHaveLength(1);
      expect(profile.education?.[0]).toMatchObject({
        institution: "MIT",
        degree: "BSc",
        field: "Computer Science",
        details: ["Algorithms", "Distributed Systems"],
      });
    });

    it("maps skills", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.skills).toHaveLength(2);
      expect(profile.skills?.[0]).toMatchObject({ name: "Frontend", items: ["React", "TypeScript", "CSS"] });
    });

    it("maps languages", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.languages).toHaveLength(2);
      expect(profile.languages?.[0]).toMatchObject({ name: "English", level: "Native" });
    });

    it("maps certificates to certifications", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.certifications).toHaveLength(1);
      expect(profile.certifications?.[0]).toMatchObject({ name: "AWS Solutions Architect", issuer: "Amazon" });
    });

    it("maps projects", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.projects).toHaveLength(1);
      expect(profile.projects?.[0]).toMatchObject({ name: "OpenLib", description: "Open source library", bullets: ["1k stars"] });
    });

    it("maps volunteer to volunteering", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.volunteering).toHaveLength(1);
      expect(profile.volunteering?.[0]).toMatchObject({ name: "Mentor", organization: "Code.org" });
    });

    it("maps awards", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.awards).toHaveLength(1);
      expect(profile.awards?.[0]).toMatchObject({ name: "Best Hack", issuer: "HackConf" });
    });

    it("maps publications", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect(profile.publications).toHaveLength(1);
      expect(profile.publications?.[0]).toMatchObject({ name: "Scaling Node.js", issuer: "O'Reilly", url: "https://oreilly.com/scaling" });
    });

    it("ignores interests and references", () => {
      const { profile } = mapJsonResumeToProfile(FULL_RESUME);
      expect((profile as Record<string, unknown>).interests).toBeUndefined();
      expect((profile as Record<string, unknown>).references).toBeUndefined();
    });

    it("returns no warnings for full resume", () => {
      const { warnings } = mapJsonResumeToProfile(FULL_RESUME);
      expect(warnings).toHaveLength(0);
    });
  });

  describe("extra fields are ignored gracefully", () => {
    it("handles unknown top-level keys", () => {
      const resume = { ...MINIMAL_RESUME, meta: { version: "v1.0.0" }, customField: true };
      const { profile } = mapJsonResumeToProfile(resume);
      expect(profile.basics?.name).toBe("John Doe");
    });
  });
});
