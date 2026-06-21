import { BoundSupabaseRepository } from "@/backend/modules/shared";
import {
  CVPublicNote,
  type CVPublicNotePrimitives,
} from "../../domain/entities/cv-public-note.entity";
import type { CVPublicNoteRepository } from "../../domain/repositories/cv-public-note.repository";
import type { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import type { UserId } from "@/backend/modules/shared";

type Row = {
  id: string;
  cv_id: string;
  user_id: string;
  anchor_type: CVPublicNotePrimitives["anchorType"];
  section_id: string | null;
  anchor_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};
const map = (row: Row) =>
  CVPublicNote.fromPrimitives({
    id: row.id,
    cvId: row.cv_id,
    userId: row.user_id,
    anchorType: row.anchor_type,
    sectionId: row.section_id,
    anchorId: row.anchor_id,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

export class SupabaseCVPublicNoteRepository
  extends BoundSupabaseRepository
  implements CVPublicNoteRepository
{
  async listForOwner(cvId: CVDocumentId, userId: UserId) {
    const { data, error } = await this.client
      .from("cv_public_notes")
      .select("*")
      .eq("cv_id", cvId.toPrimitives())
      .eq("user_id", userId.toPrimitives())
      .order("created_at");
    if (error) throw error;
    return (data as Row[]).map(map);
  }
  async listForPublishedCV(cvId: CVDocumentId) {
    const { data, error } = await this.client
      .from("cv_public_notes")
      .select("*")
      .eq("cv_id", cvId.toPrimitives())
      .order("created_at");
    if (error) throw error;
    return (data as Row[]).map(map);
  }
  async replaceForOwner({
    cvId,
    userId,
    notes,
  }: Parameters<CVPublicNoteRepository["replaceForOwner"]>[0]) {
    const cvIdValue = cvId.toPrimitives();
    const userIdValue = userId.toPrimitives();
    const { error: deleteError } = await this.client
      .from("cv_public_notes")
      .delete()
      .eq("cv_id", cvIdValue)
      .eq("user_id", userIdValue);
    if (deleteError) throw deleteError;
    if (notes.length) {
      const { error } = await this.client.from("cv_public_notes").insert(
        notes.map((note) => {
          const p = note.toPrimitives();
          return {
            cv_id: cvIdValue,
            user_id: userIdValue,
            anchor_type: p.anchorType,
            section_id: p.sectionId,
            anchor_id: p.anchorId,
            body: p.body,
          };
        }),
      );
      if (error) throw error;
    }
    return this.listForOwner(cvId, userId);
  }
}
