import type { ExecutionResult, UserId } from "@/backend/modules/shared";
import type { FollowUpEntry } from "../entities/follow-up-entry.entity";
import type { FollowUpEntryId } from "../value-objects/follow-up-entry-id.value-object";
import type { FollowUpId } from "../value-objects/follow-up-id.value-object";

export interface FollowUpEntrySearchCriteria {
  followUpIds: FollowUpId[];
  userId: UserId;
}

export interface FollowUpEntryRepository {
  search(criteria: FollowUpEntrySearchCriteria): Promise<FollowUpEntry[]>;
  findById(
    id: FollowUpEntryId,
    userId: UserId,
  ): Promise<FollowUpEntry | null>;
  save(entry: FollowUpEntry): Promise<FollowUpEntry>;
  delete(id: FollowUpEntryId, userId: UserId): Promise<ExecutionResult>;
}
