export type PublicCVNoteAnchorType = "presentation" | "section" | "item" | "bullet";
export interface PublicCVNoteResponse { id: string; anchorType: PublicCVNoteAnchorType; sectionId: string | null; anchorId: string | null; body: string }
export type ListPublicCVNotesResponse = PublicCVNoteResponse[];
export type ReplacePublicCVNotesResponse = PublicCVNoteResponse[];
