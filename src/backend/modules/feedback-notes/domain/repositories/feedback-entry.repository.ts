import type { UserId } from "@/backend/modules/shared";
import type { FeedbackEntry } from "../entities/feedback-entry.entity";
import type { FeedbackEntryId } from "../value-objects/feedback-entry-id.value-object";
import type { FeedbackId } from "../value-objects/feedback-id.value-object";

export interface FeedbackEntryRepository {
  listByFeedback(feedbackId: FeedbackId, userId: UserId): Promise<FeedbackEntry[]>;
  findById(id: FeedbackEntryId, userId: UserId): Promise<FeedbackEntry | null>;
  save(entry: FeedbackEntry): Promise<FeedbackEntry>;
  delete(id: FeedbackEntryId, userId: UserId): Promise<void>;
}
