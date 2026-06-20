import { BoundSupabaseRepository } from "@/backend/modules/shared";
import {
  FeedbackEntry,
  type FeedbackEntryPrimitives,
} from "../../domain/entities/feedback-entry.entity";
import type { FeedbackEntryRepository } from "../../domain/repositories/feedback-entry.repository";
import type { FeedbackEntryId } from "../../domain/value-objects/feedback-entry-id.value-object";
import type { FeedbackId } from "../../domain/value-objects/feedback-id.value-object";
import type { UserId } from "@/backend/modules/shared";

type FeedbackEntryRow = FeedbackEntryPrimitives;

function rowToEntry(row: FeedbackEntryRow): FeedbackEntry {
  return FeedbackEntry.fromPrimitives(row);
}

export class SupabaseFeedbackEntryRepository extends BoundSupabaseRepository implements FeedbackEntryRepository {

  async listByFeedback(feedbackId: FeedbackId, userId: UserId): Promise<FeedbackEntry[]> {
    const { data, error } = await this.client
      .from("feedback_notes_entries")
      .select("*")
      .eq("feedback_id", feedbackId.toPrimitives())
      .eq("user_id", userId.toPrimitives())
      .order("created_at", { ascending: true });

    if (error) throw error;
    return ((data ?? []) as FeedbackEntryRow[]).map(rowToEntry);
  }

  async findById(id: FeedbackEntryId, userId: UserId): Promise<FeedbackEntry | null> {
    const { data, error } = await this.client
      .from("feedback_notes_entries")
      .select("*")
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives())
      .maybeSingle();

    if (error) throw error;
    return data ? rowToEntry(data as FeedbackEntryRow) : null;
  }

  async save(entry: FeedbackEntry): Promise<FeedbackEntry> {
    const { data, error } = await this.client
      .from("feedback_notes_entries")
      .upsert(entry.toPrimitives(), { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;
    return rowToEntry(data as FeedbackEntryRow);
  }

  async delete(id: FeedbackEntryId, userId: UserId): Promise<void> {
    const { error } = await this.client
      .from("feedback_notes_entries")
      .delete()
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives());

    if (error) throw error;
  }
}
