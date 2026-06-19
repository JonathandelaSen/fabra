import type { InterviewQuestionOptionsResponse } from "@/app/api/interview-questions/options/responses";
import { SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES } from "@/shared/selection-process/constants";

export type InterviewQuestionCVOption =
  InterviewQuestionOptionsResponse["cvs"][number];

export type InterviewQuestionAnalysisOption =
  InterviewQuestionOptionsResponse["analyses"][number];

export type InterviewQuestionAIMode =
  (typeof SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES)[keyof typeof SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES];
