export interface JobMatchAnalysisCopyPasteResult {
  score: number;
  feedback: string;
  aiKeywords: string[];
  improvements: string[];
  jobKeyData: unknown | null;
  jobKeywords: string[];
  cvKeywords: string[];
  matchingKeywords: string[];
  missingKeywords: string[];
}

export interface PreviewJobMatchAnalysisCopyPasteResponse {
  parsedResult: JobMatchAnalysisCopyPasteResult;
  preview: {
    score: number;
    summary: string;
    matchingKeywordsCount: number;
    missingKeywordsCount: number;
    jobKeywordsCount: number;
    recommendationsCount: number;
    originLabel: "external_chat";
    willReplaceExistingResult: boolean;
  };
  warnings: string[];
}
