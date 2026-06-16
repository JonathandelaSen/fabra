import type {
  ActivityContextResponse,
  ListActivityContextsResponse,
} from "@/app/api/activity-contexts/responses";
import type {
  CreateWorkJournalEntryResponse,
  DeleteWorkJournalEntryResponse,
  ListWorkJournalEntriesResponse,
  UpdateWorkJournalEntryResponse,
} from "@/app/api/work-journal/entries/responses";
import type { DraftWorkJournalEntryResponse } from "@/app/api/work-journal/entries/draft/responses";
import type {
  WorkJournalContextLegacy,
  WorkJournalEntryInputMode,
  WorkJournalEntryLegacy,
} from "./work-journal-types";
import type { StoredAIProvider } from "@/lib/browser-preferences";

interface ErrorResponse {
  error?: string;
}

async function readJsonResponse<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as ErrorResponse & T;
  if (!res.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

export interface SaveWorkJournalEntryInput {
  context_id: string;
  date_start: string;
  date_end: string | null;
  topic: string | null;
  input_mode: WorkJournalEntryInputMode;
  raw_notes: string;
  final_text: string;
}

export async function listWorkJournalContexts() {
  const res = await fetch("/api/activity-contexts");
  return readJsonResponse<ListActivityContextsResponse>(
    res,
    "Could not load activity contexts."
  );
}

export async function listWorkJournalEntries() {
  const res = await fetch("/api/work-journal/entries");
  return readJsonResponse<ListWorkJournalEntriesResponse>(
    res,
    "Could not load work journal entries."
  );
}

export async function createWorkJournalEntry(input: SaveWorkJournalEntryInput) {
  const res = await fetch("/api/work-journal/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<CreateWorkJournalEntryResponse>(
    res,
    "Could not save work journal entry."
  );
}

export async function draftWorkJournalEntry(input: {
  provider: StoredAIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  context_id: string;
  date_start: string;
  date_end: string | null;
  topic: string | null;
  notes: string;
}) {
  const res = await fetch("/api/work-journal/entries/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<DraftWorkJournalEntryResponse>(
    res,
    "Could not draft work journal entry."
  );
}

export async function updateWorkJournalEntry(input: {
  id: string;
  updates: Partial<WorkJournalEntryLegacy>;
}) {
  const res = await fetch(`/api/work-journal/entries/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.updates),
  });
  return readJsonResponse<UpdateWorkJournalEntryResponse>(
    res,
    "Could not update work journal entry."
  );
}

export async function deleteWorkJournalEntry(id: string) {
  const res = await fetch(`/api/work-journal/entries/${id}`, { method: "DELETE" });
  return readJsonResponse<DeleteWorkJournalEntryResponse>(
    res,
    "Could not delete work journal entry.",
  );
}

export function toWorkJournalContextLegacyFromActivityContext(
  input: ActivityContextResponse
): WorkJournalContextLegacy {
  return {
    id: input.id,
    user_id: input.userId,
    type: input.type,
    name: input.name,
    role_or_label: null,
    status: input.status,
    is_default: input.isDefault,
    created_from_cv: false,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}
