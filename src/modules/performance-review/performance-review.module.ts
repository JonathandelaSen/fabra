import type { SupabaseClient } from "@supabase/supabase-js";
import {
  instrumentUseCases,
  type EventBus,
  type QueryBus,
  type Telemetry,
} from "@/modules/shared";
import { AddEvidenceItemUseCase } from "./application/use-cases/add-evidence-item.use-case";
import { ApplySelfAssessmentCopyPasteUseCase } from "./application/use-cases/apply-self-assessment-copy-paste.use-case";
import { CreatePerformanceReviewUseCase } from "./application/use-cases/create-performance-review.use-case";
import { DeletePerformanceReviewUseCase } from "./application/use-cases/delete-performance-review.use-case";
import { EditSelfAssessmentUseCase } from "./application/use-cases/edit-self-assessment.use-case";
import { GenerateSelfAssessmentUseCase } from "./application/use-cases/generate-self-assessment.use-case";
import { GetPerformanceReviewUseCase } from "./application/use-cases/get-performance-review.use-case";
import { ListEvidenceCandidatesUseCase } from "./application/use-cases/list-evidence-candidates.use-case";
import { ListEvidenceItemsUseCase } from "./application/use-cases/list-evidence-items.use-case";
import { ListPerformanceReviewsUseCase } from "./application/use-cases/list-performance-reviews.use-case";
import { PrepareSelfAssessmentCopyPasteUseCase } from "./application/use-cases/prepare-self-assessment-copy-paste.use-case";
import { RemoveEvidenceItemUseCase } from "./application/use-cases/remove-evidence-item.use-case";
import { ReorderEvidenceItemsUseCase } from "./application/use-cases/reorder-evidence-items.use-case";
import { UpdateEvidenceItemUseCase } from "./application/use-cases/update-evidence-item.use-case";
import { UpdatePerformanceReviewUseCase } from "./application/use-cases/update-performance-review.use-case";
import { SupabasePerformanceReviewRepository } from "./infrastructure/repositories/supabase-performance-review.repository";
import { SupabaseReviewEvidenceItemRepository } from "./infrastructure/repositories/supabase-review-evidence-item.repository";
import { GeminiReviewSelfAssessmentAIServiceFactory } from "./infrastructure/services/gemini-review-self-assessment-ai.service";
import { MockReviewSelfAssessmentAIServiceFactory } from "./infrastructure/services/mock-review-self-assessment-ai.service";
import { OllamaReviewSelfAssessmentAIServiceFactory } from "./infrastructure/services/ollama-review-self-assessment-ai.service";
import { OpenAIReviewSelfAssessmentAIServiceFactory } from "./infrastructure/services/openai-review-self-assessment-ai.service";
import { ProviderReviewSelfAssessmentAIServiceFactory } from "./infrastructure/services/provider-review-self-assessment-ai-service.factory";

const reviewRepo = new SupabasePerformanceReviewRepository();
const itemRepo = new SupabaseReviewEvidenceItemRepository();
const aiFactory = new ProviderReviewSelfAssessmentAIServiceFactory({
  geminiFactory: new GeminiReviewSelfAssessmentAIServiceFactory(),
  openaiFactory: new OpenAIReviewSelfAssessmentAIServiceFactory(),
  mockFactory: new MockReviewSelfAssessmentAIServiceFactory(),
  ollamaFactory: new OllamaReviewSelfAssessmentAIServiceFactory(),
});

function createUseCases(queryBus: QueryBus, eventBus: EventBus) {
  return {
    listReviews: new ListPerformanceReviewsUseCase({ reviewRepo }),
    getReview: new GetPerformanceReviewUseCase({ reviewRepo }),
    createReview: new CreatePerformanceReviewUseCase({ reviewRepo, eventBus }),
    updateReview: new UpdatePerformanceReviewUseCase({ reviewRepo, eventBus }),
    deleteReview: new DeletePerformanceReviewUseCase({ reviewRepo, eventBus }),
    listEvidenceCandidates: new ListEvidenceCandidatesUseCase({
      reviewRepo,
      queryBus,
    }),
    listEvidenceItems: new ListEvidenceItemsUseCase({ reviewRepo, itemRepo }),
    addEvidenceItem: new AddEvidenceItemUseCase({
      reviewRepo,
      itemRepo,
      eventBus,
    }),
    updateEvidenceItem: new UpdateEvidenceItemUseCase({ itemRepo, eventBus }),
    removeEvidenceItem: new RemoveEvidenceItemUseCase({ itemRepo, eventBus }),
    reorderEvidenceItems: new ReorderEvidenceItemsUseCase({
      reviewRepo,
      itemRepo,
      eventBus,
    }),
    editSelfAssessment: new EditSelfAssessmentUseCase({ reviewRepo, eventBus }),
    prepareSelfAssessmentCopyPaste: new PrepareSelfAssessmentCopyPasteUseCase({
      reviewRepo,
      itemRepo,
    }),
    applySelfAssessmentCopyPaste: new ApplySelfAssessmentCopyPasteUseCase({
      reviewRepo,
      eventBus,
    }),
    generateSelfAssessment: new GenerateSelfAssessmentUseCase({
      reviewRepo,
      itemRepo,
      aiFactory,
      eventBus,
    }),
  };
}

export type PerformanceReviewModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): PerformanceReviewModule;
};

export function createPerformanceReviewModule(
  queryBus: QueryBus,
  telemetry: Telemetry,
  eventBus: EventBus,
): PerformanceReviewModule {
  const useCases = instrumentUseCases(
    "performance-review",
    createUseCases(queryBus, eventBus),
    telemetry,
  );

  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      reviewRepo.bindRequest(client);
      itemRepo.bindRequest(client);
      return this;
    },
  };
}
