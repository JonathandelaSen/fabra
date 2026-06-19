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
  WorkJournalContext,
  WorkJournalEntry,
  WorkJournalEntryInputMode,
} from "./work-journal-types";
import type { StoredAIProvider } from "@/frontend/utils/browser-preferences";

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
  updates: Partial<WorkJournalEntry>;
}) {
  const res = await fetch(`/api/work-journal/entries/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toUpdateWorkJournalEntryPayload(input.updates)),
  });
  return readJsonResponse<UpdateWorkJournalEntryResponse>(
    res,
    "Could not update work journal entry."
  );
}

interface UpdateWorkJournalEntryPayload {
  context_id?: string;
  date_start?: string;
  date_end?: string | null;
  topic?: string | null;
  input_mode?: WorkJournalEntryInputMode;
  raw_notes?: string;
  final_text?: string;
}

function toUpdateWorkJournalEntryPayload(
  updates: Partial<WorkJournalEntry>
): UpdateWorkJournalEntryPayload {
  const payload: UpdateWorkJournalEntryPayload = {};
  if (updates.contextId !== undefined) payload.context_id = updates.contextId;
  if (updates.dateStart !== undefined) payload.date_start = updates.dateStart;
  if (updates.dateEnd !== undefined) payload.date_end = updates.dateEnd;
  if (updates.topic !== undefined) payload.topic = updates.topic;
  if (updates.inputMode !== undefined) payload.input_mode = updates.inputMode;
  if (updates.rawNotes !== undefined) payload.raw_notes = updates.rawNotes;
  if (updates.finalText !== undefined) payload.final_text = updates.finalText;
  return payload;
}

export async function deleteWorkJournalEntry(id: string) {
  const res = await fetch(`/api/work-journal/entries/${id}`, { method: "DELETE" });
  return readJsonResponse<DeleteWorkJournalEntryResponse>(
    res,
    "Could not delete work journal entry.",
  );
}

export function toWorkJournalContextFromActivityContext(
  input: ActivityContextResponse
): WorkJournalContext {
  return {
    id: input.id,
    userId: input.userId,
    type: input.type,
    name: input.name,
    roleOrLabel: null,
    status: input.status,
    isDefault: input.isDefault,
    createdFromCv: false,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}
