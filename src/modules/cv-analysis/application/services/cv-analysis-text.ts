import type { CVAnalysis } from "../../domain/entities/cv-analysis.entity";

export function selectBestCVAnalysisText(analysis: CVAnalysis): string {
  const primitives = analysis.toPrimitives();
  const text =
    primitives.extractedText.textPython ||
    primitives.extractedText.textPdfjs ||
    primitives.extractedText.textNode;
  if (!text) {
    throw new Error("No extracted text available for this analysis.");
  }
  return text;
}
