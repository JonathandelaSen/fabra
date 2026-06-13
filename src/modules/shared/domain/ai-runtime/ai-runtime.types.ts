import type { AIProvider } from "../value-objects/ai-provider.value-object";

export enum AIModule {
  CVAnalysis = "cv_analysis",
  JobMatchAnalysis = "job_match_analysis",
  CVLibrary = "cv_library",
  FeedbackNotes = "feedback_notes",
  JobAnalysisChat = "analysis_chat",
  SelectionProcess = "selection_process",
  WorkJournal = "work_journal",
  PerformanceReview = "performance_review",
}

export enum AIOperation {
  ScoreCV = "score_cv",
  ScoreJobMatch = "score_job_match",
  StructureCV = "structure_cv",
  EditCV = "edit_cv",
  GenerateFeedback = "generate_feedback",
  GenerateChatAnswer = "generate_chat_answer",
  GenerateInterviewAnswer = "generate_interview_answer",
  EditInterviewAnswer = "edit_interview_answer",
  DraftJournalEntry = "draft_journal_entry",
  GenerateSelfAssessment = "generate_self_assessment",
}

export enum AIEntityType {
  CVAnalysis = "cv_analysis",
  JobMatchAnalysis = "job_match_analysis",
  CVDocument = "cv_document",
  Feedback = "feedback",
  AnalysisConversation = "analysis_conversation",
  ProcessQuestion = "process_question",
  WorkJournalEntry = "work_journal_entry",
  PerformanceReview = "performance_review",
}

export enum AIAssistanceMode {
  Integrated = "integrated",
  CopyPaste = "copy_paste",
}

export enum AIInteractionProvider {
  ExternalChat = "external_chat",
}

export interface AIInteractionContext {
  interactionId: string;
  attemptId: string;
  requestId?: string;
  userId: string;
  module: AIModule;
  operation: AIOperation;
  entityType: AIEntityType;
  entityId: string;
  assistanceMode: AIAssistanceMode;
  workflowId?: string;
  schemaVersion?: string;
  provider: AIProvider | AIInteractionProvider;
  model: string | null;
}

export enum AIInteractionFailureStage {
  Prepare = "prepare",
  Request = "request",
  Response = "response",
  Parse = "parse",
  Validate = "validate",
  Apply = "apply",
}
