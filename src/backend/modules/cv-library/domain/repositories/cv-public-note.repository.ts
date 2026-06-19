import type { CVPublicNote } from "../entities/cv-public-note.entity";

export interface ReplaceCVPublicNotesInput {
  cvId: string;
  userId: string;
  notes: CVPublicNote[];
}
export interface CVPublicNoteRepository {
  listForOwner(cvId: string, userId: string): Promise<CVPublicNote[]>;
  listForPublishedCV(cvId: string): Promise<CVPublicNote[]>;
  replaceForOwner(input: ReplaceCVPublicNotesInput): Promise<CVPublicNote[]>;
}
