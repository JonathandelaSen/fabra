import { BoundSupabaseRepository } from "@/modules/shared";
import { CVPublicNote, type CVPublicNotePrimitives } from "../../domain/entities/cv-public-note.entity";
import type { CVPublicNoteRepository } from "../../domain/repositories/cv-public-note.repository";

type Row = { id: string; cv_id: string; user_id: string; anchor_type: CVPublicNotePrimitives["anchorType"]; section_id: string | null; anchor_id: string | null; body: string; created_at: string; updated_at: string };
const map = (row: Row) => CVPublicNote.fromPrimitives({ id: row.id, cvId: row.cv_id, userId: row.user_id, anchorType: row.anchor_type, sectionId: row.section_id, anchorId: row.anchor_id, body: row.body, createdAt: row.created_at, updatedAt: row.updated_at });

export class SupabaseCVPublicNoteRepository extends BoundSupabaseRepository implements CVPublicNoteRepository {
  async listForOwner(cvId: string, userId: string) {
    const { data, error } = await this.client.from("cv_public_notes").select("*").eq("cv_id", cvId).eq("user_id", userId).order("created_at");
    if (error) throw error;
    return (data as Row[]).map(map);
  }
  async listForPublishedCV(cvId: string) {
    const { data, error } = await this.client.from("cv_public_notes").select("*").eq("cv_id", cvId).order("created_at");
    if (error) throw error;
    return (data as Row[]).map(map);
  }
  async replaceForOwner({ cvId, userId, notes }: Parameters<CVPublicNoteRepository["replaceForOwner"]>[0]) {
    const { error: deleteError } = await this.client.from("cv_public_notes").delete().eq("cv_id", cvId).eq("user_id", userId);
    if (deleteError) throw deleteError;
    if (notes.length) {
      const { error } = await this.client.from("cv_public_notes").insert(notes.map((note) => { const p = note.toPrimitives(); return ({ cv_id: cvId, user_id: userId, anchor_type: p.anchorType, section_id: p.sectionId, anchor_id: p.anchorId, body: p.body }); }));
      if (error) throw error;
    }
    return this.listForOwner(cvId, userId);
  }
}
