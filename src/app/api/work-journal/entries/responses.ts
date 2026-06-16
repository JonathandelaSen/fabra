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

export type ListWorkJournalEntriesResponse = WorkJournalEntryResponse[];
export type CreateWorkJournalEntryResponse = WorkJournalEntryResponse;
export type UpdateWorkJournalEntryResponse = WorkJournalEntryResponse;

export interface DeleteWorkJournalEntryResponse {
  ok: true;
}

interface WorkJournalContextSource {
  toPrimitives(): {
    id: string;
    userId: string;
    type: WorkJournalContextType;
    name: string;
    roleOrLabel?: string | null;
    status: WorkJournalContextStatus;
    isDefault: boolean;
    createdFromCv?: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface WorkJournalEntrySource {
  toPrimitives(): {
    id: string;
    userId: string;
    contextId: string;
    dateStart: string;
    dateEnd: string | null;
    topic: string | null;
    inputMode: WorkJournalEntryInputMode;
    rawNotes: string;
    finalText: string;
    createdAt: string;
    updatedAt: string;
  };
}

export function toWorkJournalContextResponse(
  context: WorkJournalContextSource
): WorkJournalContextResponse {
  const primitives = context.toPrimitives();
  return {
    id: primitives.id,
    userId: primitives.userId,
    type: primitives.type,
    name: primitives.name,
    roleOrLabel: primitives.roleOrLabel ?? null,
    status: primitives.status,
    isDefault: primitives.isDefault,
    createdFromCv: primitives.createdFromCv ?? false,
    createdAt: primitives.createdAt,
    updatedAt: primitives.updatedAt,
  };
}

export function toWorkJournalEntryResponse(
  entry: WorkJournalEntrySource,
  context?: WorkJournalContextSource | null
): WorkJournalEntryResponse {
  const primitives = entry.toPrimitives();
  return {
    id: primitives.id,
    userId: primitives.userId,
    contextId: primitives.contextId,
    dateStart: primitives.dateStart,
    dateEnd: primitives.dateEnd,
    topic: primitives.topic,
    inputMode: primitives.inputMode,
    rawNotes: primitives.rawNotes,
    finalText: primitives.finalText,
    createdAt: primitives.createdAt,
    updatedAt: primitives.updatedAt,
    context: context ? toWorkJournalContextResponse(context) : undefined,
  };
}
