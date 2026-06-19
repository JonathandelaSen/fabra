import type {
  JOB_MATCH_DETAIL_TABS,
  JOB_MATCH_VIEW_MODES,
} from "./constants";

export type DetailTab =
  (typeof JOB_MATCH_DETAIL_TABS)[keyof typeof JOB_MATCH_DETAIL_TABS];

export type JobMatchViewMode =
  (typeof JOB_MATCH_VIEW_MODES)[keyof typeof JOB_MATCH_VIEW_MODES];

import type { GetJobMatchAnalysisResponse } from "@/app/api/job-match-analyses/responses";

export type {
  JobMatchAnalysisDetailResponse,
  ListJobMatchAnalysesResponse,
} from "@/app/api/job-match-analyses/responses";
export type JobMatchAnalysisDetail = GetJobMatchAnalysisResponse;
export type { InterviewQuestionResponse as InterviewQuestionSummary } from "@/app/api/interview-questions/responses";
export type {
  JobAnalysisChatConversation,
  JobAnalysisChatMessage,
} from "@/app/api/job-match-analyses/[id]/chat/responses";
