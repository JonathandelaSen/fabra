import { BoundSupabaseRepository, type UserId } from "@/backend/modules/shared";
import { PerformanceReview } from "../../domain/entities/performance-review.entity";
import type {
  PerformanceReviewRepository,
  PerformanceReviewSearchCriteria,
} from "../../domain/repositories/performance-review.repository";
import type { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import type { ReviewStatusValue } from "../../domain/value-objects/review-status.value-object";
import type { ReviewTypeValue } from "../../domain/value-objects/review-type.value-object";
import type { SelfAssessmentModeValue } from "../../domain/value-objects/self-assessment-mode.value-object";

interface PerformanceReviewRow {
  id: string;
  user_id: string;
  activity_context_id: string | null;
  title: string;
  review_type: ReviewTypeValue;
  review_date: string;
  period_start: string;
  period_end: string;
  status: ReviewStatusValue;
  self_assessment_content: string | null;
  self_assessment_generated_at: string | null;
  self_assessment_mode: SelfAssessmentModeValue | null;
  created_at: string;
  updated_at: string;
}

function rowToReview(row: PerformanceReviewRow): PerformanceReview {
  return PerformanceReview.fromPrimitives({
    id: row.id,
    userId: row.user_id,
    activityContextId: row.activity_context_id,
    title: row.title,
    reviewType: row.review_type,
    reviewDate: row.review_date,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    status: row.status,
    selfAssessmentContent: row.self_assessment_content,
    selfAssessmentGeneratedAt: row.self_assessment_generated_at,
    selfAssessmentMode: row.self_assessment_mode,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function reviewToRow(review: PerformanceReview): PerformanceReviewRow {
  const p = review.toPrimitives();
  return {
    id: p.id,
    user_id: p.userId,
    activity_context_id: p.activityContextId,
    title: p.title,
    review_type: p.reviewType,
    review_date: p.reviewDate,
    period_start: p.periodStart,
    period_end: p.periodEnd,
    status: p.status,
    self_assessment_content: p.selfAssessmentContent,
    self_assessment_generated_at: p.selfAssessmentGeneratedAt,
    self_assessment_mode: p.selfAssessmentMode,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export class SupabasePerformanceReviewRepository
  extends BoundSupabaseRepository
  implements PerformanceReviewRepository
{
  async search(
    criteria: PerformanceReviewSearchCriteria,
  ): Promise<PerformanceReview[]> {
    const { data, error } = await this.client
      .from("performance_reviews")
      .select("*")
      .eq("user_id", criteria.userId.toPrimitives())
      .order("review_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as PerformanceReviewRow[]).map(rowToReview);
  }

  async findById(
    id: PerformanceReviewId,
    userId: UserId,
  ): Promise<PerformanceReview | null> {
    const { data, error } = await this.client
      .from("performance_reviews")
      .select("*")
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives())
      .maybeSingle();

    if (error) throw error;
    return data ? rowToReview(data as PerformanceReviewRow) : null;
  }

  async save(review: PerformanceReview): Promise<PerformanceReview> {
    const { data, error } = await this.client
      .from("performance_reviews")
      .upsert(reviewToRow(review), { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;
    return rowToReview(data as PerformanceReviewRow);
  }

  async delete(id: PerformanceReviewId, userId: UserId): Promise<boolean> {
    const { error, count } = await this.client
      .from("performance_reviews")
      .delete({ count: "exact" })
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives());

    if (error) throw error;
    return (count ?? 0) > 0;
  }
}
