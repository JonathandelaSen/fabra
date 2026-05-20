export interface CVAnalysisCopyPasteResult {
  score: number;
  feedback: string;
  keywords: string[];
  improvements: string[];
}

export interface PreviewCVAnalysisCopyPasteResponse {
  parsedResult: CVAnalysisCopyPasteResult;
  preview: {
    score: number;
    summary: string;
    strengthsCount: number;
    improvementAreasCount: number;
    recommendationsCount: number;
    originLabel: "external_chat";
    willReplaceExistingResult: boolean;
  };
  warnings: string[];
}
