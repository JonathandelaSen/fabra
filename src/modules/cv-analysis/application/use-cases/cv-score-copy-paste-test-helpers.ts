import { vi } from "vitest";
import type { EventTracker, EventBus } from "@/modules/shared";
import { CVAnalysis } from "../../domain/entities/cv-analysis.entity";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";

export function makeCopyPasteAnalysis(
  overrides: Partial<ReturnType<CVAnalysis["toPrimitives"]>> = {},
) {
  return CVAnalysis.fromPrimitives({
    id: "analysis-1",
    userId: "user-1",
    cvDocumentId: "cv-1",
    cvStructuredProfileId: null,
    title: "General",
    filename: "cv.pdf",
    fileSize: 100,
    pdfStoragePath: null,
    extractedText: {
      textPython: "extracted cv text",
      textPdfjs: null,
      textNode: null,
      extractErrorPython: null,
      extractErrorPdfjs: null,
      extractErrorNode: null,
    },
    aiModel: null,
    score: null,
    feedback: null,
    keywords: [],
    improvements: [],
    aiContext: null,
    analyzedAt: null,
    legacyAnalysisId: null,
    createdAt: "2026-05-13T10:00:00.000Z",
    updatedAt: "2026-05-13T10:00:00.000Z",
    ...overrides,
  });
}

export function copyPasteRepo(
  analysis: CVAnalysis | null = makeCopyPasteAnalysis(),
) {
  return {
    search: vi.fn(),
    findById: vi.fn(async () => analysis),
    save: vi.fn(async (item) => item),
    delete: vi.fn(),
  } satisfies CVAnalysisRepository;
}

export function copyPasteTracker() {
  return { record: vi.fn(async () => undefined) } satisfies EventTracker;
}

export function eventBus() {
  return { publish: vi.fn().mockResolvedValue(undefined) } satisfies EventBus;
}

export const validCopyPasteResult = {
  score: 88,
  feedback: "Buen CV con margen de mejora.",
  keywords: ["TypeScript", "React"],
  improvements: ["Añade métricas"],
};

export const validCopyPasteEnvelope = JSON.stringify({
  workflowId: "cv_analysis.score",
  schemaVersion: "1",
  result: validCopyPasteResult,
});
