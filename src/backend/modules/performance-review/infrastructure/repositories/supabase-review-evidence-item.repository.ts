import { BoundSupabaseRepository, type UserId } from "@/backend/modules/shared";
import { ReviewEvidenceItem } from "../../domain/entities/review-evidence-item.entity";
import type {
  ReviewEvidenceItemRepository,
  ReviewEvidenceItemSearchCriteria,
} from "../../domain/repositories/review-evidence-item.repository";
import type { ReviewEvidenceItemId } from "../../domain/value-objects/review-evidence-item-id.value-object";
import type { EvidenceSourceValue } from "../../domain/value-objects/evidence-source.value-object";

interface ReviewEvidenceItemRow {
  id: string;
  user_id: string;
  review_id: string;
  source: EvidenceSourceValue;
  source_id: string | null;
  content: string;
  highlighted: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

function rowToItem(row: ReviewEvidenceItemRow): ReviewEvidenceItem {
  return ReviewEvidenceItem.fromPrimitives({
    id: row.id,
    userId: row.user_id,
    reviewId: row.review_id,
    source: row.source,
    sourceId: row.source_id,
    content: row.content,
    highlighted: row.highlighted,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function itemToRow(item: ReviewEvidenceItem): ReviewEvidenceItemRow {
  const p = item.toPrimitives();
  return {
    id: p.id,
    user_id: p.userId,
    review_id: p.reviewId,
    source: p.source,
    source_id: p.sourceId,
    content: p.content,
    highlighted: p.highlighted,
    position: p.position,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export class SupabaseReviewEvidenceItemRepository
  extends BoundSupabaseRepository
  implements ReviewEvidenceItemRepository
{
  async search(
    criteria: ReviewEvidenceItemSearchCriteria,
  ): Promise<ReviewEvidenceItem[]> {
    const { data, error } = await this.client
      .from("review_evidence_items")
      .select("*")
      .eq("user_id", criteria.userId.toPrimitives())
      .eq("review_id", criteria.reviewId.toPrimitives())
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return ((data ?? []) as ReviewEvidenceItemRow[]).map(rowToItem);
  }

  async findById(
    id: ReviewEvidenceItemId,
    userId: UserId,
  ): Promise<ReviewEvidenceItem | null> {
    const { data, error } = await this.client
      .from("review_evidence_items")
      .select("*")
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives())
      .maybeSingle();

    if (error) throw error;
    return data ? rowToItem(data as ReviewEvidenceItemRow) : null;
  }

  async save(item: ReviewEvidenceItem): Promise<ReviewEvidenceItem> {
    const { data, error } = await this.client
      .from("review_evidence_items")
      .upsert(itemToRow(item), { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;
    return rowToItem(data as ReviewEvidenceItemRow);
  }

  async delete(id: ReviewEvidenceItemId, userId: UserId): Promise<boolean> {
    const { error, count } = await this.client
      .from("review_evidence_items")
      .delete({ count: "exact" })
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives());

    if (error) throw error;
    return (count ?? 0) > 0;
  }
}
