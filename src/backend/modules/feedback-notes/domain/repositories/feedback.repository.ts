import type { UserId } from "@/backend/modules/shared";
import type {
  Feedback,
  FeedbackStatus,
} from "../entities/feedback.entity";
import type { FeedbackId } from "../value-objects/feedback-id.value-object";

export interface FeedbackSearchCriteria {
  userId: UserId;
  status?: FeedbackStatus | "all" | null;
}

export interface FeedbackRepository {
  list(criteria: FeedbackSearchCriteria): Promise<Feedback[]>;
  findById(id: FeedbackId, userId: UserId): Promise<Feedback | null>;
  save(feedback: Feedback): Promise<Feedback>;
  delete(id: FeedbackId, userId: UserId): Promise<void>;
}
