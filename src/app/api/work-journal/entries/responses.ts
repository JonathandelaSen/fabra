import {
  WORK_JOURNAL_CONTEXT_STATUSES,
  WORK_JOURNAL_CONTEXT_TYPES,
  WORK_JOURNAL_ENTRY_INPUT_MODES,
} from "@/shared/work-journal/constants";

export type WorkJournalContextType =
  (typeof WORK_JOURNAL_CONTEXT_TYPES)[keyof typeof WORK_JOURNAL_CONTEXT_TYPES];
export type WorkJournalContextStatus =
  (typeof WORK_JOURNAL_CONTEXT_STATUSES)[keyof typeof WORK_JOURNAL_CONTEXT_STATUSES];
export type WorkJournalEntryInputMode =
  (typeof WORK_JOURNAL_ENTRY_INPUT_MODES)[keyof typeof WORK_JOURNAL_ENTRY_INPUT_MODES];

export interface WorkJournalContextResponse {
  id: string;
  userId: string;
  type: WorkJournalContextType;
  name: string;
  roleOrLabel: string | null;
  status: WorkJournalContextStatus;
  isDefault: boolean;
  createdFromCv: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkJournalEntryResponse {
  id: string;
  userId: string;
  contextId: string;
  dateStart: string;
  dateEnd: string | null;
  topic: string | null;
  inputMode: WorkJournalEntryInputMode;
  rawNotes: string;
  finalText: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  context?: WorkJournalContextResponse | null;
}

export interface WorkJournalContextLegacy {
  id: string;
  user_id: string;
  type: WorkJournalContextType;
  name: string;
  role_or_label: string | null;
  status: WorkJournalContextStatus;
  is_default: boolean;
  created_from_cv: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkJournalEntryLegacy {
  id: string;
  user_id: string;
  context_id: string;
  date_start: string;
  date_end: string | null;
  topic: string | null;
  input_mode: WorkJournalEntryInputMode;
  raw_notes: string;
  final_text: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  context?: WorkJournalContextLegacy | null;
}

export type WorkJournalEntryPresenterOutput = WorkJournalEntryLegacy;

export type ListWorkJournalEntriesResponse = WorkJournalEntryResponse[];
export type CreateWorkJournalEntryResponse = WorkJournalEntryResponse;
export type UpdateWorkJournalEntryResponse = WorkJournalEntryResponse;

export interface DeleteWorkJournalEntryResponse {
  ok: true;
}

export function toWorkJournalContextResponse(
  input: WorkJournalContextLegacy,
): WorkJournalContextResponse {
  return {
    id: input.id,
    userId: input.user_id,
    type: input.type,
    name: input.name,
    roleOrLabel: input.role_or_label,
    status: input.status,
    isDefault: input.is_default,
    createdFromCv: input.created_from_cv,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
  };
}

export function toWorkJournalEntryResponse(
  input: WorkJournalEntryLegacy,
): WorkJournalEntryResponse {
  return {
    id: input.id,
    userId: input.user_id,
    contextId: input.context_id,
    dateStart: input.date_start,
    dateEnd: input.date_end,
    topic: input.topic,
    inputMode: input.input_mode,
    rawNotes: input.raw_notes,
    finalText: input.final_text,
    metadata: input.metadata ?? {},
    createdAt: input.created_at,
    updatedAt: input.updated_at,
    context: input.context
      ? toWorkJournalContextResponse(input.context)
      : (input.context ?? null),
  };
}
