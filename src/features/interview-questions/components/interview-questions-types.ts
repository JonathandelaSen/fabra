import { SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES } from "@/shared/selection-process/constants";

export interface InterviewQuestionCVOption {
  id: string;
  name: string;
}

export interface InterviewQuestionAnalysisOption {
  id: string;
  title: string;
  analysisMode: "job_match";
}

export type InterviewQuestionAIMode =
  (typeof SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES)[keyof typeof SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES];
