import { Timestamp, UserId, type AIProvider, type EventBus } from "@/modules/shared";
import type { PerformanceReview } from "../../domain/entities/performance-review.entity";
import { PerformanceReviewNotFoundError } from "../../domain/errors/performance-review-not-found.error";
import type { PerformanceReviewRepository } from "../../domain/repositories/performance-review.repository";
import type { ReviewEvidenceItemRepository } from "../../domain/repositories/review-evidence-item.repository";
import type { ReviewSelfAssessmentAIServiceFactory } from "../../domain/repositories/review-self-assessment-ai.service";
import { PerformanceReviewId } from "../../domain/value-objects/performance-review-id.value-object";
import { SelfAssessmentMode } from "../../domain/value-objects/self-assessment-mode.value-object";
import { buildReviewSelfAssessmentAIInput } from "../services/build-self-assessment-input";

export interface GenerateSelfAssessmentInput {
  reviewId: string;
  userId: string;
  provider: AIProvider;
  apiKey?: string;
  model: string;
}

export class GenerateSelfAssessmentUseCase {
  constructor(
    private readonly deps: {
      reviewRepo: PerformanceReviewRepository;
      itemRepo: ReviewEvidenceItemRepository;
      aiFactory: ReviewSelfAssessmentAIServiceFactory;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: GenerateSelfAssessmentInput): Promise<PerformanceReview> {
    const userId = UserId.fromPrimitives(input.userId);
    const reviewId = PerformanceReviewId.fromPrimitives(input.reviewId);
    const review = await this.deps.reviewRepo.findById(reviewId, userId);
    if (!review) throw new PerformanceReviewNotFoundError();

    const items = await this.deps.itemRepo.search({ userId, reviewId });
    const aiInput = buildReviewSelfAssessmentAIInput(review, items);

    const service = this.deps.aiFactory.create({
      provider: input.provider,
      apiKey: input.apiKey,
      model: input.model,
    });
    const content = await service.generate(aiInput);

    const now = Timestamp.fromPrimitives(new Date().toISOString());
    review.attachSelfAssessment({
      content,
      mode: SelfAssessmentMode.fromPrimitives("integrated"),
      generatedAt: now,
      updatedAt: now,
    });

    const saved = await this.deps.reviewRepo.save(review);
    await this.deps.eventBus.publish(review.pullDomainEvents());
    return saved;
  }
}
