export interface PrepareCVAnalysisCopyPasteResponse {
  workflowId: "cv_analysis.score";
  schemaVersion: "1";
  interactionId: string;
  attemptId: string;
  prompt: string;
  expectedResponse: { kind: "json"; envelope: true };
}
