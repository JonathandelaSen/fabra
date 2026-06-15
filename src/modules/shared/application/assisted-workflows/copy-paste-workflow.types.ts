export const ASSISTANCE_MODE = {
  manual: "manual",
  copyPaste: "copy_paste",
  integrated: "integrated",
} as const;

export type AssistanceMode =
  (typeof ASSISTANCE_MODE)[keyof typeof ASSISTANCE_MODE];

export const WORKFLOW_STATUS = {
  existing: "existing",
  pilot: "pilot",
  planned: "planned",
  notApplicable: "not_applicable",
} as const;

export type WorkflowStatus =
  (typeof WORKFLOW_STATUS)[keyof typeof WORKFLOW_STATUS];

export const MANUAL_SUPPORT_KINDS = {
  directEdit: "direct_edit",
  formInput: "form_input",
  existingScreen: "existing_screen",
  other: "other",
} as const;

export type ManualSupportKind =
  (typeof MANUAL_SUPPORT_KINDS)[keyof typeof MANUAL_SUPPORT_KINDS];

export type ManualSupport =
  | { supported: true; kind: ManualSupportKind }
  | { supported: false; reason: string };

export interface AssistedWorkflowSummary {
  id: string;
  label: string;
  manual: ManualSupport;
  copyPaste: { supported: boolean; status: WorkflowStatus; notes?: string };
  integrated: { supported: boolean; providers: string[]; notes?: string };
}

export type CopyPasteExpectedResponse =
  | { kind: "plain_text" }
  | { kind: "json"; envelope: true };

export interface CopyPasteEnvelopeExpected {
  workflowId: string;
  schemaVersion: string;
}

export interface CopyPasteJsonEnvelope<TResult extends object = object> {
  workflowId: string;
  schemaVersion: string;
  result: TResult;
}
