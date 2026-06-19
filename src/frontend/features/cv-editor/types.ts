export type { PreviewCVEditorCopyPasteResponse } from "@/app/api/cvs/[id]/edit/copy-paste/preview/responses";
export type { ApplyCVEditorCopyPasteResponse } from "@/app/api/cvs/[id]/edit/copy-paste/apply/responses";

export type CVEditorTab = "ai" | "manual";
export type CVSaveState = "idle" | "saving" | "saved";
export type CVEditorDisplayMode = "desktop" | "mobile";
