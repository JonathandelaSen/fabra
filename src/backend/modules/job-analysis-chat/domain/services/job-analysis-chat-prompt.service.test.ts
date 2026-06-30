import { describe, expect, it } from "vitest";
import { JobAnalysisChatPromptService } from "./job-analysis-chat-prompt.service";
import type { Analysis } from "@/lib/analysis-types";
import type { JobAnalysisChatContext } from "../value-objects/job-analysis-chat-context.value-object";

describe("JobAnalysisChatPromptService", () => {
  const service = new JobAnalysisChatPromptService();

  const analysis = {
    title: "Senior Engineer",
    ai_score: 80,
    job_description: "Build distributed systems",
    job_url: "https://jobs.example.com/1",
  } as unknown as Analysis;

  it("returns the JSON-shaped system instruction", () => {
    expect(service.systemInstruction()).toContain(
      '{ "answer": "<final assistant answer>" }',
    );
  });

  it("includes the job posting and analysis in the integrated prompt", () => {
    const prompt = service.build({
      message: "Am I a fit?",
      analysis,
      cvText: "React engineer",
      history: [{ role: "assistant", content: "Earlier note" }],
      people: [
        {
          name: "Marta García",
          role: "hiring_manager",
          jobTitle: "Engineering Manager",
          organization: "Acme",
          links: [{ url: "https://example.com/marta", label: "Profile" }],
          notes: "Owns platform reliability.",
        },
      ],
    });

    expect(prompt).toContain("LATEST USER QUESTION");
    expect(prompt).toContain("Build distributed systems");
    expect(prompt).toContain("Senior Engineer");
    expect(prompt).toContain("Earlier note");
    expect(prompt).toContain("PEOPLE IN THIS HIRING PROCESS");
    expect(prompt).toContain("Marta García");
    expect(prompt).toContain("Owns platform reliability.");
  });

  it("renders a plain-text copy-paste prompt from context", () => {
    const context = {
      cv: { name: "My CV", type: "template", profile: { basics: {} } },
      analysis: { title: "Senior Engineer", job_description: "Build systems" },
      cvText: "React engineer",
      people: [
        {
          name: "Marta García",
          role: "hiring_manager",
          jobTitle: null,
          organization: "Acme",
          links: [],
          notes: "Ask about the platform roadmap.",
        },
      ],
    } as unknown as JobAnalysisChatContext;

    const prompt = service.buildForClipboard({
      message: "Am I a fit?",
      context,
      history: [{ role: "user", content: "hi" }] as never,
    });

    expect(prompt).toContain("Do not wrap it in JSON");
    expect(prompt).toContain("Build systems");
    expect(prompt).toContain("My CV");
    expect(prompt).toContain("Marta García");
    expect(prompt).toContain("Ask about the platform roadmap.");
    expect(prompt).toContain("CV, offer, analysis, and people data");
  });
});
