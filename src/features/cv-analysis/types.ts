import type { InterviewQuestionResponse } from "@/app/api/interview-questions/responses";

export type InterviewQuestionSummary = InterviewQuestionResponse;
export type DeleteAnalysisHandler = (id: string) => Promise<void>;
