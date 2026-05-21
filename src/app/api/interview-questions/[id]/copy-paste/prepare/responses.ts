export interface PrepareInterviewQuestionCopyPasteResponse {
  workflowId: "interview_question.answer";
  schemaVersion: "1";
  prompt: string;
  expectedResponse: { kind: "plain_text" };
  privacyNotice: string;
}
