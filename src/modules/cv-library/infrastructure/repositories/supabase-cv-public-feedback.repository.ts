import { BoundSupabaseRepository } from "@/modules/shared";
import { CVPublicFeedback } from "../../domain/entities/cv-public-feedback.entity";
import type { CVPublicFeedbackRepository } from "../../domain/repositories/cv-public-feedback.repository";

type Row = { id: string; cv_id: string; user_id: string; giver_name: string | null; giver_context: string | null; feedback_text: string; created_at: string };
const map = (row: Row) => CVPublicFeedback.fromPrimitives({ id: row.id, cvId: row.cv_id, userId: row.user_id, giverName: row.giver_name, giverContext: row.giver_context, feedbackText: row.feedback_text, createdAt: row.created_at });
export class SupabaseCVPublicFeedbackRepository extends BoundSupabaseRepository implements CVPublicFeedbackRepository {
  async listForOwner(cvId: string, userId: string) {
    const { data, error } = await this.client.from("cv_public_feedback").select("*").eq("cv_id", cvId).eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(map);
  }
  async deleteForOwner(id: string, userId: string) {
    const { error } = await this.client.from("cv_public_feedback").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }
}
