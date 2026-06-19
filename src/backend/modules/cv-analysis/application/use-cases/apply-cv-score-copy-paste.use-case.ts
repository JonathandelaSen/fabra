import {
  AIAssistanceMode,
  AIEntityType,
  AIInteractionAppliedEvent,
  AIInteractionProvider,
  AIModule,
  AIOperation,
  UserId,
  type EventBus,
} from "@/modules/shared";
import { CVAnalysis } from "../../domain/entities/cv-analysis.entity";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";
import type { CVScoringAIResult } from "../../domain/repositories/cv-scoring-ai.service";
import { CVAnalysisId } from "../../domain/value-objects/cv-analysis-id.value-object";
import { ASSISTANCE_MODE } from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import {
  CV_SCORE_COPY_PASTE_MODEL,
  CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
  CV_SCORE_COPY_PASTE_WORKFLOW_ID,
  validateCVScoreCopyPasteResult,
} from "../services/cv-score-copy-paste-result.validator";

export interface ApplyCVScoreCopyPasteInput {
  id: string;
  userId: string;
  parsedResult: CVScoringAIResult;
  interactionId?: string;
  attemptId?: string;
}

export class ApplyCVScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: CVAnalysisRepository;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: ApplyCVScoreCopyPasteInput): Promise<CVAnalysis | null> {
    const id = CVAnalysisId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const current = await this.deps.repo.findById(id, userId);
    if (!current) return null;

    const result = validateCVScoreCopyPasteResult(input.parsedResult);
    const now = new Date().toISOString();
    const primitives = current.toPrimitives();

    current.applyAIResult({
      aiModel: CV_SCORE_COPY_PASTE_MODEL,
      score: result.score,
      feedback: result.feedback,
      keywords: result.keywords,
      improvements: result.improvements,
      aiContext: {
        ...(typeof primitives.aiContext === "object" &&
        primitives.aiContext !== null &&
        !Array.isArray(primitives.aiContext)
          ? primitives.aiContext
          : {}),
        assistanceMode: ASSISTANCE_MODE.copyPaste,
        workflowId: CV_SCORE_COPY_PASTE_WORKFLOW_ID,
        schemaVersion: CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
      },
      analyzedAt: now,
      updatedAt: now,
    });

    const updated = await this.deps.repo.save(current);

    const events = current.pullDomainEvents();
    await this.deps.eventBus.publish(events);
    await this.deps.eventBus.publish([
      new AIInteractionAppliedEvent({
        context: {
          interactionId: input.interactionId ?? crypto.randomUUID(),
          attemptId: input.attemptId ?? crypto.randomUUID(),
          userId: input.userId,
          module: AIModule.CVAnalysis,
          operation: AIOperation.ScoreCV,
          entityType: AIEntityType.CVAnalysis,
          entityId: input.id,
          assistanceMode: AIAssistanceMode.CopyPaste,
          workflowId: CV_SCORE_COPY_PASTE_WORKFLOW_ID,
          schemaVersion: CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
          provider: AIInteractionProvider.ExternalChat,
          model: null,
        },
      }),
    ]);

    return updated;
  }
}
