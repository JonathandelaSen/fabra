import type { CVAnalysisExtractedTextPrimitives } from "../entities/cv-analysis.entity";

export interface CVAnalysisDetailsPrimitives {
  cvDocumentId: string | null;
  cvStructuredProfileId: string | null;
  title: string;
  filename: string;
  fileSize: number | null;
  pdfStoragePath: string | null;
  extractedText: CVAnalysisExtractedTextPrimitives;
  aiModel: string | null;
  score: number | null;
  feedback: string | null;
  keywords: string[];
  improvements: string[];
  aiContext: unknown | null;
  analyzedAt: string | null;
  legacyAnalysisId: string | null;
}
