import { BoundSupabaseRepository } from "@/backend/modules/shared";
import {
  Feedback,
  type FeedbackStatus,
} from "../../domain/entities/feedback.entity";
import type {
  FeedbackRepository,
  FeedbackSearchCriteria,
} from "../../domain/repositories/feedback.repository";
import type { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";
import type { UserId } from "@/backend/modules/shared";

interface FeedbackRow {
  id: string;
  user_id: string;
  activity_context_id: string;
  person_name: string;
  status: FeedbackStatus;
  final_feedback: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  activity_contexts?: {
    name: string;
  };
}

function rowToFeedback(row: FeedbackRow): Feedback {
  return Feedback.fromPrimitives({
    id: row.id,
    user_id: row.user_id,
    activity_context_id: row.activity_context_id,
    activity_context_name: row.activity_contexts?.name,
    person_name: row.person_name,
    status: row.status,
    final_feedback: row.final_feedback,
    closed_at: row.closed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
}

function feedbackToRow(feedback: Feedback): FeedbackRow {
  const primitives = feedback.toPrimitives();
  return {
    id: primitives.id,
    user_id: primitives.user_id,
    activity_context_id: primitives.activity_context_id,
    person_name: primitives.person_name,
    status: primitives.status,
    final_feedback: primitives.final_feedback,
    closed_at: primitives.closed_at,
    created_at: primitives.created_at,
    updated_at: primitives.updated_at,
  };
}

export class SupabaseFeedbackRepository extends BoundSupabaseRepository implements FeedbackRepository {

  async list(criteria: FeedbackSearchCriteria): Promise<Feedback[]> {
    let query = this.client
      .from("feedback_notes_feedbacks")
      .select("*, activity_contexts(name)")
      .eq("user_id", criteria.userId.toPrimitives())
      .order("updated_at", { ascending: false });

    if (criteria.status && criteria.status !== "all") {
      query = query.eq("status", criteria.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as FeedbackRow[]).map(rowToFeedback);
  }

  async findById(id: FeedbackId, userId: UserId): Promise<Feedback | null> {
    const { data, error } = await this.client
      .from("feedback_notes_feedbacks")
      .select("*, activity_contexts(name)")
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives())
      .maybeSingle();

    if (error) throw error;
    return data ? rowToFeedback(data as FeedbackRow) : null;
  }

  async save(feedback: Feedback): Promise<Feedback> {
    const { data, error } = await this.client
      .from("feedback_notes_feedbacks")
      .upsert(feedbackToRow(feedback), { onConflict: "id" })
      .select("*, activity_contexts(name)")
      .single();

    if (error) throw error;
    return rowToFeedback(data as FeedbackRow);
  }

  async delete(id: FeedbackId, userId: UserId): Promise<void> {
    const { error } = await this.client
      .from("feedback_notes_feedbacks")
      .delete()
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives());

    if (error) throw error;
  }
}
