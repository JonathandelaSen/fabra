export const SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES = {
  GENERATE: "generate",
  EDIT: "edit",
} as const;

export type CopyPastePrepareMode =
  (typeof SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES)[keyof typeof SELECTION_PROCESS_COPY_PASTE_PREPARE_MODES];
