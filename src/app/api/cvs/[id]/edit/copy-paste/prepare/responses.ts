import type {
  CV_EDITOR_COPY_PASTE_SCHEMA_VERSION,
  CV_EDITOR_COPY_PASTE_WORKFLOW_ID,
} from "@/modules/cv-library";

export interface PrepareCVEditorCopyPasteResponse {
  workflowId: typeof CV_EDITOR_COPY_PASTE_WORKFLOW_ID;
  schemaVersion: typeof CV_EDITOR_COPY_PASTE_SCHEMA_VERSION;
  prompt: string;
  expectedResponse: { kind: "json"; envelope: true };
  privacyNotice: string;
}
