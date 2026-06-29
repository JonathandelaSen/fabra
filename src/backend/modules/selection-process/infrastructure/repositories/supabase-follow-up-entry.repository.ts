import {
  BoundSupabaseRepository,
  ExecutionResult,
  type UserId,
} from "@/backend/modules/shared";
import { FollowUpEntry } from "../../domain/entities/follow-up-entry.entity";
import type {
  FollowUpEntryRepository,
  FollowUpEntrySearchCriteria,
} from "../../domain/repositories/follow-up-entry.repository";
import type { FollowUpEntryId } from "../../domain/value-objects/follow-up-entry-id.value-object";
import type { FollowUpStatusPrimitives } from "../../domain/value-objects/follow-up-status.value-object";

interface FollowUpEntryRow {
  id: string;
  user_id: string;
  follow_up_id: string;
  status: FollowUpStatusPrimitives;
  title: string | null;
  notes: string | null;
  next_action: string | null;
  next_action_at: string | null;
  updates_current_status: boolean;
  occurred_at: string;
  created_at: string;
  updated_at: string;
}

function rowToEntry(row: FollowUpEntryRow): FollowUpEntry {
  return FollowUpEntry.fromPrimitives({
    id: row.id,
    userId: row.user_id,
    followUpId: row.follow_up_id,
    status: row.status,
    title: row.title,
    notes: row.notes,
    nextAction: row.next_action,
    nextActionAt: row.next_action_at,
    updatesCurrentStatus: row.updates_current_status,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function entryToRow(entry: FollowUpEntry): FollowUpEntryRow {
  const primitives = entry.toPrimitives();
  return {
    id: primitives.id,
    user_id: primitives.userId,
    follow_up_id: primitives.followUpId,
    status: primitives.status,
    title: primitives.title,
    notes: primitives.notes,
    next_action: primitives.nextAction,
    next_action_at: primitives.nextActionAt,
    updates_current_status: primitives.updatesCurrentStatus,
    occurred_at: primitives.occurredAt,
    created_at: primitives.createdAt,
    updated_at: primitives.updatedAt,
  };
}

export class SupabaseFollowUpEntryRepository
  extends BoundSupabaseRepository
  implements FollowUpEntryRepository
{
  async search(
    criteria: FollowUpEntrySearchCriteria,
  ): Promise<FollowUpEntry[]> {
    if (criteria.followUpIds.length === 0) return [];
    const { data, error } = await this.client
      .from("follow_up_entries")
      .select("*")
      .eq("user_id", criteria.userId.toPrimitives())
      .in(
        "follow_up_id",
        criteria.followUpIds.map((id) => id.toPrimitives()),
      )
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as FollowUpEntryRow[]).map(rowToEntry);
  }

  async findById(
    id: FollowUpEntryId,
    userId: UserId,
  ): Promise<FollowUpEntry | null> {
    const { data, error } = await this.client
      .from("follow_up_entries")
      .select("*")
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives())
      .maybeSingle();

    if (error) throw error;
    return data ? rowToEntry(data as FollowUpEntryRow) : null;
  }

  async save(entry: FollowUpEntry): Promise<FollowUpEntry> {
    const { data, error } = await this.client
      .from("follow_up_entries")
      .upsert(entryToRow(entry), { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;
    return rowToEntry(data as FollowUpEntryRow);
  }

  async delete(
    id: FollowUpEntryId,
    userId: UserId,
  ): Promise<ExecutionResult> {
    const { error, count } = await this.client
      .from("follow_up_entries")
      .delete({ count: "exact" })
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives());

    if (error) throw error;
    return ExecutionResult.fromPrimitives((count ?? 0) > 0);
  }
}
