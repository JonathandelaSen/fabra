import { vi } from "vitest";
import type { EventTracker, EventBus } from "@/modules/shared";
import { JobMatchAnalysis } from "../../domain/entities/job-match-analysis.entity";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";

export function makeJobMatchAnalysis(
  overrides: Partial<ReturnType<JobMatchAnalysis["toPrimitives"]>> = {},
) {
  return JobMatchAnalysis.fromPrimitives({
    id: "analysis-1",
    userId: "user-1",
    cvDocumentId: "cv-1",
    cvStructuredProfileId: null,
    jobOpportunityId: null,
    title: "Job Match",
    filename: "cv.pdf",
    fileSize: 100,
    pdfStoragePath: null,
    extractedText: {
      textPython: "extracted cv text for job match",
      textPdfjs: null,
      textNode: null,
      extractErrorPython: null,
      extractErrorPdfjs: null,
      extractErrorNode: null,
    },
    aiModel: null,
    score: null,
    feedback: null,
    aiKeywords: [],
    improvements: [],
    jobSnapshot: null,
    jobKeywords: [],
    cvKeywords: [],
    matchingKeywords: [],
    missingKeywords: [],
    analyzedAt: null,
    legacyAnalysisId: null,
    createdAt: "2026-05-13T10:00:00.000Z",
    updatedAt: "2026-05-13T10:00:00.000Z",
    ...overrides,
  });
}

export function jobMatchRepo(
  analysis: JobMatchAnalysis | null = makeJobMatchAnalysis(),
) {
  return {
    search: vi.fn(),
    findById: vi.fn(async () => analysis),
    save: vi.fn(async (item) => item),
    delete: vi.fn(),
  } satisfies JobMatchAnalysisRepository;
}

export function jobMatchTracker() {
  return { record: vi.fn(async () => undefined) } satisfies EventTracker;
}

export function eventBus() {
  return { publish: vi.fn().mockResolvedValue(undefined) } satisfies EventBus;
}

export const validJobMatchResult = {
  score: 74,
  feedback: "Buena coincidencia con la oferta.",
  aiKeywords: ["React", "TypeScript"],
  improvements: ["Añade experiencia en testing"],
  jobKeyData: { title: "Frontend Dev", company: null, location: null, remote: null, salary: null, seniority: null, contractType: null, benefits: [], requirements: [], responsibilities: [], notablePoints: [] },
  jobKeywords: ["React", "TypeScript", "Node"],
  cvKeywords: ["React", "TypeScript"],
  matchingKeywords: ["React", "TypeScript"],
  missingKeywords: ["Node"],
};

export const validJobMatchEnvelope = JSON.stringify({
  workflowId: "job_match_analysis.score",
  schemaVersion: "1",
  result: validJobMatchResult,
});
