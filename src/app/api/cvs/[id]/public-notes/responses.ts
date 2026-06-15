import { CV_PUBLIC_NOTE_ANCHOR_TYPES } from "@/shared/cv-library/constants";

export type PublicCVNoteAnchorType =
  (typeof CV_PUBLIC_NOTE_ANCHOR_TYPES)[keyof typeof CV_PUBLIC_NOTE_ANCHOR_TYPES];
export interface PublicCVNoteResponse { id: string; anchorType: PublicCVNoteAnchorType; sectionId: string | null; anchorId: string | null; body: string }
export type ListPublicCVNotesResponse = PublicCVNoteResponse[];
export type ReplacePublicCVNotesResponse = PublicCVNoteResponse[];
