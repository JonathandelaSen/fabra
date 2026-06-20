import { CVPublicNote, type CVPublicNotePrimitives } from "../../domain/entities/cv-public-note.entity";
import type { CVPublicNoteRepository } from "../../domain/repositories/cv-public-note.repository";
import { UserId } from "@/backend/modules/shared";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";

export class ListCVPublicNotesUseCase {
  constructor(private readonly repo: CVPublicNoteRepository) {}
  execute(input: { cvId: string; userId: string }): Promise<CVPublicNote[]> { 
    return this.repo.listForOwner(
      CVDocumentId.fromPrimitives(input.cvId),
      UserId.fromPrimitives(input.userId),
    ); 
  }
}
export class ListPublishedCVPublicNotesUseCase {
  constructor(private readonly repo: CVPublicNoteRepository) {}
  execute(cvId: string): Promise<CVPublicNote[]> { 
    return this.repo.listForPublishedCV(CVDocumentId.fromPrimitives(cvId)); 
  }
}
export class ReplaceCVPublicNotesUseCase {
  constructor(private readonly repo: CVPublicNoteRepository) {}
  execute(input: { cvId: string; userId: string; notes: Array<Pick<CVPublicNotePrimitives, "anchorType" | "sectionId" | "anchorId" | "body">> }): Promise<CVPublicNote[]> {
    const now = new Date().toISOString();
    return this.repo.replaceForOwner({
      cvId: CVDocumentId.fromPrimitives(input.cvId),
      userId: UserId.fromPrimitives(input.userId),
      notes: input.notes.map((note) => CVPublicNote.fromPrimitives({ ...note, id: crypto.randomUUID(), cvId: input.cvId, userId: input.userId, createdAt: now, updatedAt: now })),
    });
  }
}
