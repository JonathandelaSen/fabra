export type ProcessingEventStatus =
  | "started"
  | "success"
  | "warning"
  | "error";

export interface ProcessingEventResponse {
  id: string;
  userId: string | null;
  cvId: string | null;
  analysisId: string | null;
  requestId: string;
  stage: string;
  status: ProcessingEventStatus;
  source: string | null;
  durationMs: number | null;
  fileSize: number | null;
  textLength: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface ProcessingEventPresenterOutput {
  id: string;
  user_id: string | null;
  cv_id: string | null;
  analysis_id: string | null;
  request_id: string;
  stage: string;
  status: ProcessingEventStatus;
  source: string | null;
  duration_ms: number | null;
  file_size: number | null;
  text_length: number | null;
  error_code: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ListProcessingEventsResponse {
  events: ProcessingEventResponse[];
}

export function toProcessingEventResponse(
  event: ProcessingEventPresenterOutput,
): ProcessingEventResponse {
  return {
    id: event.id,
    userId: event.user_id,
    cvId: event.cv_id,
    analysisId: event.analysis_id,
    requestId: event.request_id,
    stage: event.stage,
    status: event.status,
    source: event.source,
    durationMs: event.duration_ms,
    fileSize: event.file_size,
    textLength: event.text_length,
    errorCode: event.error_code,
    errorMessage: event.error_message,
    metadata: event.metadata,
    createdAt: event.created_at,
  };
}

export function toListProcessingEventsResponse(
  events: ProcessingEventPresenterOutput[],
): ListProcessingEventsResponse {
  return {
    events: events.map(toProcessingEventResponse),
  };
}
