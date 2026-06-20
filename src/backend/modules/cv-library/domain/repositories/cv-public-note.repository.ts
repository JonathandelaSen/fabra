import type { UserId } from "@/backend/modules/shared";
import type { CVPublicNote } from "../entities/cv-public-note.entity";
import type { CVDocumentId } from "../value-objects/cv-document-id.value-object";

export interface ReplaceCVPublicNotesInput {
  cvId: CVDocumentId;
  userId: UserId;
  notes: CVPublicNote[];
}
export interface CVPublicNoteRepository {
  listForOwner(cvId: CVDocumentId, userId: UserId): Promise<CVPublicNote[]>;
  listForPublishedCV(cvId: CVDocumentId): Promise<CVPublicNote[]>;
  replaceForOwner(input: ReplaceCVPublicNotesInput): Promise<CVPublicNote[]>;
}
