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

export type ManualSupport =
  | { supported: true; kind: "direct_edit" | "form_input" | "existing_screen" | "other" }
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
