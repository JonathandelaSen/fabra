import {
  AIAssistanceMode,
  AIEntityType,
  AIInteractionFailedEvent,
  AIInteractionFailureStage,
  AIInteractionProvider,
  AIInteractionResponseReceivedEvent,
  AIInteractionResponseValidatedEvent,
  AIModule,
  AIOperation,
  UserId,
  type EventBus,
} from "@/backend/modules/shared";
import {
  extractCopyPasteJson,
} from "@/backend/modules/shared/application/assisted-workflows/copy-paste-json-parser";
import {
  validateCopyPasteEnvelope,
} from "@/backend/modules/shared/application/assisted-workflows/copy-paste-json-envelope";
import type { CVScoringAIResult } from "../../domain/repositories/cv-scoring-ai.service";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";
import { CVAnalysisId } from "../../domain/value-objects/cv-analysis-id.value-object";
import {
  CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
  CV_SCORE_COPY_PASTE_WORKFLOW_ID,
  validateCVScoreCopyPasteResult,
} from "../services/cv-score-copy-paste-result.validator";
import { CVScorePreview } from "../../domain/value-objects/cv-score-preview.value-object";

export interface PreviewCVScoreCopyPasteInput {
  id: string;
  userId: string;
  rawResponse: string;
  interactionId?: string;
  attemptId?: string;
}

export class PreviewCVScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: CVAnalysisRepository;
      eventBus?: EventBus;
    },
  ) {}

  async execute(
    input: PreviewCVScoreCopyPasteInput,
  ): Promise<CVScorePreview | null> {
    const id = CVAnalysisId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const analysis = await this.deps.repo.findById(id, userId);
    if (!analysis) return null;

    const context = {
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
    };
    await this.deps.eventBus?.publish([
      new AIInteractionResponseReceivedEvent({
        context,
        rawResponse: input.rawResponse,
      }),
    ]);
    let parsedResult;
    try {
      const envelope = extractCopyPasteJson(input.rawResponse);
      const result = validateCopyPasteEnvelope(envelope, {
        workflowId: CV_SCORE_COPY_PASTE_WORKFLOW_ID,
        schemaVersion: CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
      });
      parsedResult = validateCVScoreCopyPasteResult(result);
      await this.deps.eventBus?.publish([
        new AIInteractionResponseValidatedEvent({ context, parsedResult }),
      ]);
    } catch (error) {
      await this.deps.eventBus?.publish([
        new AIInteractionFailedEvent({
          context,
          stage: AIInteractionFailureStage.Validate,
          errorName: error instanceof Error ? error.name : "UnknownError",
          errorMessage: error instanceof Error ? error.message : String(error),
        }),
      ]);
      throw error;
    }
    const primitives = analysis.toPrimitives();
    const willReplaceExistingResult = primitives.score !== null;

    return CVScorePreview.fromPrimitives({
      parsedResult,
      preview: {
        score: parsedResult.score,
        summary: parsedResult.feedback.slice(0, 280),
        strengthsCount: parsedResult.keywords.length,
        improvementAreasCount: parsedResult.improvements.length,
        recommendationsCount: parsedResult.improvements.length,
        originLabel: "external_chat",
        willReplaceExistingResult,
      },
      warnings: willReplaceExistingResult
        ? ["This will replace the current analysis result."]
        : [],
    });
  }
}
