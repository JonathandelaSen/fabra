import { describe, expect, it } from "vitest";
import { JobMatchScoringPromptService } from "./job-match-scoring-prompt.service";
import {
  JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
  JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
} from "../value-objects/job-match-copy-paste-constants";

describe("JobMatchScoringPromptService", () => {
  const service = new JobMatchScoringPromptService();

  it("includes the job description and persona in the integrated prompt", () => {
    const prompt = service.build({ jobDescription: "Senior Go engineer" });

    expect(prompt).toContain("elite technical recruiter");
    expect(prompt).toContain("Senior Go engineer");
    expect(prompt).toContain("You must respond ONLY with valid JSON");
  });

  it("uses the named-language instruction when a known language is given", () => {
    const prompt = service.build({
      jobDescription: "x",
      language: "es",
    });

    expect(prompt).toContain('"jobKeyData.notablePoints" in Spanish.');
  });

  it("falls back to the CV-language instruction for unknown languages", () => {
    const prompt = service.build({ jobDescription: "x", language: "zz" });

    expect(prompt).toContain("in the same language as the CV");
  });

  it("renders the source URL block only when a URL is provided", () => {
    const withUrl = service.build({
      jobDescription: "x",
      jobUrl: "https://jobs.example.com/1",
    });
    const withoutUrl = service.build({ jobDescription: "x" });

    expect(withUrl).toContain("https://jobs.example.com/1");
    expect(withoutUrl).not.toContain("The source URL provided by the user");
  });

  it("wraps the integrated prompt in the copy-paste envelope", () => {
    const prompt = service.buildForClipboard({
      jobDescription: "x",
      text: "CV body text",
    });

    expect(prompt).toContain("elite technical recruiter");
    expect(prompt).toContain(JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID);
    expect(prompt).toContain(JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION);
    expect(prompt).toContain("CV body text");
  });
});
