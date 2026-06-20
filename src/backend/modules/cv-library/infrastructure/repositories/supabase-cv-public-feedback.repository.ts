import { BoundSupabaseRepository } from "@/backend/modules/shared";
import { CVPublicFeedback } from "../../domain/entities/cv-public-feedback.entity";
import type { CVPublicFeedbackRepository } from "../../domain/repositories/cv-public-feedback.repository";
import type { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import type { CVPublicFeedbackId } from "../../domain/value-objects/cv-public-feedback-id.value-object";
import type { UserId } from "@/backend/modules/shared";

type Row = { id: string; cv_id: string; user_id: string; giver_name: string | null; giver_context: string | null; feedback_text: string; created_at: string };
const map = (row: Row) => CVPublicFeedback.fromPrimitives({ id: row.id, cvId: row.cv_id, userId: row.user_id, giverName: row.giver_name, giverContext: row.giver_context, feedbackText: row.feedback_text, createdAt: row.created_at });
export class SupabaseCVPublicFeedbackRepository extends BoundSupabaseRepository implements CVPublicFeedbackRepository {
  async listForOwner(cvId: CVDocumentId, userId: UserId) {
    const { data, error } = await this.client.from("cv_public_feedback").select("*").eq("cv_id", cvId.toPrimitives()).eq("user_id", userId.toPrimitives()).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(map);
  }
  async deleteForOwner(id: CVPublicFeedbackId, userId: UserId) {
    const { error } = await this.client.from("cv_public_feedback").delete().eq("id", id.toPrimitives()).eq("user_id", userId.toPrimitives());
    if (error) throw error;
  }
}
