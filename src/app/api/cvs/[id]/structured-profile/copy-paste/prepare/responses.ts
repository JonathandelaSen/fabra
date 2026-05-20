import type {
  CV_PROFILE_COPY_PASTE_SCHEMA_VERSION,
  CV_PROFILE_COPY_PASTE_WORKFLOW_ID,
} from "@/modules/cv-library";

export interface PrepareCVProfileCopyPasteResponse {
  workflowId: typeof CV_PROFILE_COPY_PASTE_WORKFLOW_ID;
  schemaVersion: typeof CV_PROFILE_COPY_PASTE_SCHEMA_VERSION;
  prompt: string;
  expectedResponse: { kind: "json"; envelope: true };
  privacyNotice: string;
}
