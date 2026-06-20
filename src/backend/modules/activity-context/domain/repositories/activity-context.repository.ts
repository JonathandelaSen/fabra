import type { Counter, EntityId, UserId } from "@/backend/modules/shared";
import type { ActivityContext } from "../entities/activity-context.entity";
import type { ActivityContextHiddenSuggestion } from "../value-objects/activity-context-hidden-suggestion.value-object";
import type { ActivityContextHiddenSuggestions } from "../value-objects/activity-context-hidden-suggestions.value-object";
import type { ActivityContextRecordReassignment } from "../value-objects/activity-context-record-reassignment.value-object";

export interface ActivityContextRepository {
  search(userId: UserId): Promise<ActivityContext[]>;
  findById(id: EntityId, userId: UserId): Promise<ActivityContext | null>;
  findDefault(userId: UserId): Promise<ActivityContext | null>;
  save(context: ActivityContext): Promise<ActivityContext>;
  delete(id: EntityId, userId: UserId): Promise<void>;
  listHiddenSuggestions(userId: UserId): Promise<ActivityContextHiddenSuggestions>;
  hideSuggestion(userId: UserId, suggestion: ActivityContextHiddenSuggestion): Promise<void>;
  reassignRecordsToDefault(reassignment: ActivityContextRecordReassignment): Promise<Counter>;
  countAssignedRecords(id: EntityId, userId: UserId): Promise<Counter>;
}
