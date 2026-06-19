import type {
  CommitmentItemResponse,
  CommitmentOutcomeResponse,
  CommitmentResponse,
  CommitmentsWorkspaceResponse,
  DeleteCommitmentResponse,
} from "@/app/api/commitments/responses";
import type {
  ObjectiveItemStatus,
  ObjectiveOutcomeStatus,
  ObjectiveOutcomeType,
  ObjectivePriority,
  ObjectiveSource,
  ObjectiveStatus,
} from "../types";

export type {
  Objective,
  ObjectiveContext,
  ObjectiveContextType,
  ObjectiveItem,
  ObjectiveItemStatus,
  ObjectiveOutcome,
  ObjectiveOutcomeStatus,
  ObjectiveOutcomeType,
  ObjectivePriority,
  ObjectiveSource,
  ObjectiveStatus,
  ObjectiveWithRelations,
  ObjectivesWorkspace,
} from "../types";

export interface SaveObjectiveInput {
  contextId: string;
  title: string;
  description: string | null;
  successCriteria: string | null;
  resultNotes: string | null;
  source: ObjectiveSource;
  status?: ObjectiveStatus;
  priority: ObjectivePriority | null;
  startDate: string;
  targetDate: string | null;
}

export interface SaveObjectiveItemInput {
  title?: string;
  notes?: string | null;
  evidenceNotes?: string | null;
  status?: ObjectiveItemStatus;
  dueDate?: string | null;
  completedAt?: string | null;
  orderIndex?: number;
}

export interface SaveObjectiveOutcomeInput {
  title?: string;
  description?: string | null;
  type?: ObjectiveOutcomeType;
  status?: ObjectiveOutcomeStatus;
  amount?: number | null;
  currency?: string | null;
  decidedAt?: string | null;
}

async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

export async function getObjectivesWorkspace() {
  const res = await fetch("/api/commitments");
  return readJsonResponse<CommitmentsWorkspaceResponse>(
    res,
    "Could not load objectives."
  );
}

export async function createObjective(input: SaveObjectiveInput) {
  const res = await fetch("/api/commitments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<CommitmentResponse>(res, "Could not save objective.");
}

export async function updateObjective({
  id,
  updates,
}: {
  id: string;
  updates: Partial<SaveObjectiveInput>;
}) {
  const res = await fetch(`/api/commitments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return readJsonResponse<CommitmentResponse>(res, "Could not save objective.");
}

export async function deleteObjective(id: string) {
  const res = await fetch(`/api/commitments/${id}`, { method: "DELETE" });
  return readJsonResponse<DeleteCommitmentResponse>(
    res,
    "Could not delete objective."
  );
}

export async function createObjectiveItem({
  objectiveId,
  input,
}: {
  objectiveId: string;
  input: Required<Pick<SaveObjectiveItemInput, "title">> &
    Omit<SaveObjectiveItemInput, "title">;
}) {
  const res = await fetch(`/api/commitments/${objectiveId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<CommitmentItemResponse>(res, "Could not save action item.");
}

export async function updateObjectiveItem({
  id,
  updates,
}: {
  id: string;
  updates: SaveObjectiveItemInput;
}) {
  const res = await fetch(`/api/commitments/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return readJsonResponse<CommitmentItemResponse>(res, "Could not save action item.");
}

export async function deleteObjectiveItem(id: string) {
  const res = await fetch(`/api/commitments/items/${id}`, { method: "DELETE" });
  return readJsonResponse<DeleteCommitmentResponse>(
    res,
    "Could not delete action item."
  );
}

export async function createObjectiveOutcome({
  objectiveId,
  input,
}: {
  objectiveId: string;
  input: Required<Pick<SaveObjectiveOutcomeInput, "title" | "type">> &
    Omit<SaveObjectiveOutcomeInput, "title" | "type">;
}) {
  const res = await fetch(`/api/commitments/${objectiveId}/outcomes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<CommitmentOutcomeResponse>(res, "Could not save outcome.");
}

export async function updateObjectiveOutcome({
  id,
  updates,
}: {
  id: string;
  updates: SaveObjectiveOutcomeInput;
}) {
  const res = await fetch(`/api/commitments/outcomes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return readJsonResponse<CommitmentOutcomeResponse>(res, "Could not save outcome.");
}

export async function deleteObjectiveOutcome(id: string) {
  const res = await fetch(`/api/commitments/outcomes/${id}`, {
    method: "DELETE",
  });
  return readJsonResponse<DeleteCommitmentResponse>(
    res,
    "Could not delete outcome."
  );
}
