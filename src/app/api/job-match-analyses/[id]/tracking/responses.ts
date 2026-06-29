import type { JobMatchAnalysisOfferStatus } from "../../responses";

export interface FollowUpEntryResponse {
  id: string;
  status: JobMatchAnalysisOfferStatus;
  title: string | null;
  notes: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateFollowUpEntryResponse = FollowUpEntryResponse;
export type UpdateFollowUpEntryResponse = FollowUpEntryResponse;

export interface DeleteFollowUpEntryResponse {
  success: true;
}
