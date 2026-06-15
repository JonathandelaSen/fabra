import { ACTIVITY_CONTEXT_STATUSES, ACTIVITY_CONTEXT_TYPES } from "@/shared/activity-context/constants";
import {
  COMMITMENT_ITEM_STATUSES,
  COMMITMENT_OUTCOME_STATUSES,
  COMMITMENT_OUTCOME_TYPES,
  COMMITMENT_PRIORITIES,
  COMMITMENT_SOURCES,
  COMMITMENT_STATUSES,
} from "@/shared/commitments/constants";

export type CommitmentSource =
  (typeof COMMITMENT_SOURCES)[keyof typeof COMMITMENT_SOURCES];
export type CommitmentStatus =
  (typeof COMMITMENT_STATUSES)[keyof typeof COMMITMENT_STATUSES];
export type CommitmentPriority =
  (typeof COMMITMENT_PRIORITIES)[keyof typeof COMMITMENT_PRIORITIES];
export type CommitmentContextType =
  (typeof ACTIVITY_CONTEXT_TYPES)[keyof typeof ACTIVITY_CONTEXT_TYPES];
export type CommitmentContextStatus =
  (typeof ACTIVITY_CONTEXT_STATUSES)[keyof typeof ACTIVITY_CONTEXT_STATUSES];
export type CommitmentItemStatus =
  (typeof COMMITMENT_ITEM_STATUSES)[keyof typeof COMMITMENT_ITEM_STATUSES];
export type CommitmentOutcomeType =
  (typeof COMMITMENT_OUTCOME_TYPES)[keyof typeof COMMITMENT_OUTCOME_TYPES];
export type CommitmentOutcomeStatus =
  (typeof COMMITMENT_OUTCOME_STATUSES)[keyof typeof COMMITMENT_OUTCOME_STATUSES];

export interface CommitmentContextResponse {
  id: string;
  userId: string;
  type: CommitmentContextType;
  name: string;
  roleOrLabel: string | null;
  status: CommitmentContextStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentResponse {
  id: string;
  userId: string;
  contextId: string;
  title: string;
  description: string | null;
  successCriteria: string | null;
  resultNotes: string | null;
  source: CommitmentSource;
  status: CommitmentStatus;
  priority: CommitmentPriority | null;
  startDate: string;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentItemResponse {
  id: string;
  userId: string;
  commitmentId: string;
  title: string;
  notes: string | null;
  evidenceNotes: string | null;
  status: CommitmentItemStatus;
  dueDate: string | null;
  completedAt: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentOutcomeResponse {
  id: string;
  userId: string;
  commitmentId: string;
  type: CommitmentOutcomeType;
  status: CommitmentOutcomeStatus;
  title: string;
  description: string | null;
  amount: number | null;
  currency: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentWithRelationsResponse extends CommitmentResponse {
  items: CommitmentItemResponse[];
  outcomes: CommitmentOutcomeResponse[];
}

export interface CommitmentsWorkspaceResponse {
  contexts: CommitmentContextResponse[];
  commitments: CommitmentWithRelationsResponse[];
}

export interface DeleteCommitmentResponse {
  ok: true;
}

type CommitmentContextPresenterOutput = CommitmentContextResponse;
type CommitmentPresenterOutput = CommitmentResponse;
type CommitmentItemPresenterOutput = CommitmentItemResponse;
type CommitmentOutcomePresenterOutput = CommitmentOutcomeResponse;

interface CommitmentsWorkspacePresenterOutput {
  contexts: CommitmentContextPresenterOutput[];
  commitments: Array<
    CommitmentPresenterOutput & {
      items: CommitmentItemPresenterOutput[];
      outcomes: CommitmentOutcomePresenterOutput[];
    }
  >;
}

export function toCommitmentContextResponse(
  input: CommitmentContextPresenterOutput
): CommitmentContextResponse {
  return { ...input };
}

export function toCommitmentResponse(
  input: CommitmentPresenterOutput
): CommitmentResponse {
  return { ...input };
}

export function toCommitmentItemResponse(
  input: CommitmentItemPresenterOutput
): CommitmentItemResponse {
  return { ...input };
}

export function toCommitmentOutcomeResponse(
  input: CommitmentOutcomePresenterOutput
): CommitmentOutcomeResponse {
  return { ...input };
}

export function toCommitmentsWorkspaceResponse(
  input: CommitmentsWorkspacePresenterOutput
): CommitmentsWorkspaceResponse {
  return {
    contexts: input.contexts.map(toCommitmentContextResponse),
    commitments: input.commitments.map((commitment) => ({
      ...toCommitmentResponse(commitment),
      items: commitment.items.map(toCommitmentItemResponse),
      outcomes: commitment.outcomes.map(toCommitmentOutcomeResponse),
    })),
  };
}
