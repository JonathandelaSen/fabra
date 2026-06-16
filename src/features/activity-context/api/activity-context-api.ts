import type {
  ActivityContextResponse,
  ActivityContextResponseType,
  ActivityContextSuggestionResponse,
  CreateActivityContextResponse,
  ListActivityContextsResponse,
} from "@/app/api/activity-contexts/responses";
import type {
  DeleteActivityContextResponse,
  UpdateActivityContextResponse,
} from "@/app/api/activity-contexts/[id]/responses";
import type { HandleActivityContextSuggestionResponse } from "@/app/api/activity-contexts/suggestions/responses";
import { ACTIVITY_CONTEXT_SUGGESTION_ACTIONS } from "@/shared/activity-context/constants";

interface ErrorResponse {
  error?: string;
}

async function readJsonResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as ErrorResponse & T;
  if (!res.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

export type ActivityContext = ActivityContextResponse;
export type ActivityContextType = ActivityContextResponseType;
export type ActivityContextSuggestion = ActivityContextSuggestionResponse;
type ActivityContextSuggestionAction =
  (typeof ACTIVITY_CONTEXT_SUGGESTION_ACTIONS)[keyof typeof ACTIVITY_CONTEXT_SUGGESTION_ACTIONS];

export interface CreateActivityContextInput {
  type: ActivityContextType;
  name: string;
}

export interface UpdateActivityContextInput {
  type?: ActivityContextType;
  name?: string;
  status?: ActivityContext["status"];
}

export async function listActivityContexts() {
  const res = await fetch("/api/activity-contexts");
  return readJsonResponse<ListActivityContextsResponse>(
    res,
    "Could not load activity contexts."
  );
}

export async function createActivityContext(input: CreateActivityContextInput) {
  const res = await fetch("/api/activity-contexts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<CreateActivityContextResponse>(
    res,
    "Could not create activity context."
  );
}

export async function updateActivityContext(input: {
  id: string;
  updates: UpdateActivityContextInput;
}) {
  const res = await fetch(`/api/activity-contexts/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.updates),
  });
  return readJsonResponse<UpdateActivityContextResponse>(
    res,
    "Could not update activity context."
  );
}

export async function deleteActivityContext(id: string) {
  const res = await fetch(`/api/activity-contexts/${id}`, { method: "DELETE" });
  return readJsonResponse<DeleteActivityContextResponse>(
    res,
    "Could not delete activity context."
  );
}

export async function handleActivityContextSuggestion(input: {
  action: ActivityContextSuggestionAction;
  type: ActivityContextType;
  name: string;
  roleOrLabel: string | null;
}) {
  const res = await fetch("/api/activity-contexts/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<HandleActivityContextSuggestionResponse>(
    res,
    "Could not update activity context suggestion."
  );
}
