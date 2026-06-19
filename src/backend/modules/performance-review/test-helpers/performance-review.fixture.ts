import { vi } from "vitest";
import { getSupabaseClient } from "@/modules/test-helpers/setup";
import type { EventBus } from "@/modules/shared";
import { SupabasePerformanceReviewRepository } from "../infrastructure/repositories/supabase-performance-review.repository";
import { SupabaseReviewEvidenceItemRepository } from "../infrastructure/repositories/supabase-review-evidence-item.repository";

export function makePerformanceReviewDeps() {
  const reviewRepo = new SupabasePerformanceReviewRepository();
  const itemRepo = new SupabaseReviewEvidenceItemRepository();
  const client = getSupabaseClient();
  reviewRepo.bindRequest(client);
  itemRepo.bindRequest(client);
  const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
  return { reviewRepo, itemRepo, eventBus, eventBusPort: eventBus as unknown as EventBus };
}

export const reviewInput = {
  title: "H1 Performance Review",
  reviewType: "performance_review",
  reviewDate: "2026-07-01",
  periodStart: "2026-01-01",
  periodEnd: "2026-06-30",
};

export async function seedReview(
  deps: ReturnType<typeof makePerformanceReviewDeps>,
  userId: string,
) {
  const { CreatePerformanceReviewUseCase } = await import(
    "../application/use-cases/create-performance-review.use-case"
  );
  return new CreatePerformanceReviewUseCase({
    reviewRepo: deps.reviewRepo,
    eventBus: deps.eventBusPort,
  }).execute({ userId, ...reviewInput });
}
