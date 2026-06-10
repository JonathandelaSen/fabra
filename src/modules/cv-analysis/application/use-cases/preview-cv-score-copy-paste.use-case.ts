import { UserId } from "@/modules/shared";
import {
  extractCopyPasteJson,
} from "@/modules/shared/application/assisted-workflows/copy-paste-json-parser";
import {
  validateCopyPasteEnvelope,
} from "@/modules/shared/application/assisted-workflows/copy-paste-json-envelope";
import type { CVScoringAIResult } from "../../domain/repositories/cv-scoring-ai.service";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";
import { CVAnalysisId } from "../../domain/value-objects/cv-analysis-id.value-object";
import {
  CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
  CV_SCORE_COPY_PASTE_WORKFLOW_ID,
  validateCVScoreCopyPasteResult,
} from "../services/cv-score-copy-paste-result.validator";

export interface PreviewCVScoreCopyPasteInput {
  id: string;
  userId: string;
  rawResponse: string;
}

export interface PreviewCVScoreCopyPasteResult {
  parsedResult: CVScoringAIResult;
  preview: {
    score: number;
    summary: string;
    strengthsCount: number;
    improvementAreasCount: number;
    recommendationsCount: number;
    originLabel: "external_chat";
    willReplaceExistingResult: boolean;
  };
  warnings: string[];
}

export class PreviewCVScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: CVAnalysisRepository;
    },
  ) {}

  async execute(
    input: PreviewCVScoreCopyPasteInput,
  ): Promise<PreviewCVScoreCopyPasteResult | null> {
    const id = CVAnalysisId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const analysis = await this.deps.repo.findById(id, userId);
    if (!analysis) return null;

    const envelope = extractCopyPasteJson(input.rawResponse);
    const result = validateCopyPasteEnvelope(envelope, {
      workflowId: CV_SCORE_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
    });
    const parsedResult = validateCVScoreCopyPasteResult(result);
    const primitives = analysis.toPrimitives();
    const willReplaceExistingResult = primitives.score !== null;

    return {
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
    };
  }
}
