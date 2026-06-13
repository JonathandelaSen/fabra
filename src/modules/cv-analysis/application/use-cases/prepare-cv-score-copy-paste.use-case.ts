import {
  AIAssistanceMode,
  AIEntityType,
  AIInteractionPreparedEvent,
  AIInteractionProvider,
  AIModule,
  AIOperation,
  UserId,
  type EventBus,
} from "@/modules/shared";
import type { CVAnalysisRepository } from "../../domain/repositories/cv-analysis.repository";
import { CVAnalysisId } from "../../domain/value-objects/cv-analysis-id.value-object";
import { selectBestCVAnalysisText } from "../services/cv-analysis-text";
import {
  CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
  CV_SCORE_COPY_PASTE_WORKFLOW_ID,
} from "../services/cv-score-copy-paste-result.validator";

export interface PrepareCVScoreCopyPasteInput {
  id: string;
  userId: string;
  additionalContext?: string | null;
  language?: string | null;
  requestId?: string;
}

export interface PrepareCVScoreCopyPasteResult {
  workflowId: typeof CV_SCORE_COPY_PASTE_WORKFLOW_ID;
  schemaVersion: typeof CV_SCORE_COPY_PASTE_SCHEMA_VERSION;
  interactionId: string;
  attemptId: string;
  prompt: string;
  expectedResponse: { kind: "json"; envelope: true };
}

export class PrepareCVScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: CVAnalysisRepository;
      buildPrompt: (input: {
        text: string;
        additionalContext?: string | null;
        language?: string | null;
      }) => string;
      eventBus?: EventBus;
    },
  ) {}

  async execute(
    input: PrepareCVScoreCopyPasteInput,
  ): Promise<PrepareCVScoreCopyPasteResult | null> {
    const id = CVAnalysisId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const analysis = await this.deps.repo.findById(id, userId);
    if (!analysis) return null;

    const prompt = this.deps.buildPrompt({
      text: selectBestCVAnalysisText(analysis),
      additionalContext: input.additionalContext,
      language: input.language,
    });
    const interactionId = crypto.randomUUID();
    const attemptId = crypto.randomUUID();
    const context = {
      interactionId,
      attemptId,
      requestId: input.requestId,
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
      new AIInteractionPreparedEvent({ context, prompt }),
    ]);

    return {
      workflowId: CV_SCORE_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
      interactionId,
      attemptId,
      prompt,
      expectedResponse: { kind: "json", envelope: true },
    };
  }
}
