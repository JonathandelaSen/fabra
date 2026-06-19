import type {
  CommitmentContextResponse,
  CommitmentContextType,
  CommitmentItemResponse,
  CommitmentItemStatus,
  CommitmentOutcomeResponse,
  CommitmentOutcomeStatus,
  CommitmentOutcomeType,
  CommitmentPriority,
  CommitmentResponse,
  CommitmentSource,
  CommitmentStatus,
  CommitmentsWorkspaceResponse,
} from "@/app/api/commitments/responses";

export type ObjectiveContext = CommitmentContextResponse;
export type ObjectiveContextType = CommitmentContextType;
export type Objective = CommitmentResponse;
export type ObjectiveWithRelations =
  CommitmentsWorkspaceResponse["commitments"][number];
export type ObjectiveItem = CommitmentItemResponse;
export type ObjectiveItemStatus = CommitmentItemStatus;
export type ObjectiveOutcome = CommitmentOutcomeResponse;
export type ObjectiveOutcomeType = CommitmentOutcomeType;
export type ObjectiveOutcomeStatus = CommitmentOutcomeStatus;
export type ObjectivePriority = CommitmentPriority;
export type ObjectiveSource = CommitmentSource;
export type ObjectiveStatus = CommitmentStatus;
export type ObjectivesWorkspace = CommitmentsWorkspaceResponse;
