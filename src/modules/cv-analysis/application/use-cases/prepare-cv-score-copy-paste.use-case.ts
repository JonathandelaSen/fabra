import { UserId } from "@/modules/shared";
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
}

export interface PrepareCVScoreCopyPasteResult {
  workflowId: typeof CV_SCORE_COPY_PASTE_WORKFLOW_ID;
  schemaVersion: typeof CV_SCORE_COPY_PASTE_SCHEMA_VERSION;
  prompt: string;
  expectedResponse: { kind: "json"; envelope: true };
  privacyNotice: string;
}

export class PrepareCVScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: CVAnalysisRepository;
      buildPrompt: (input: {
        text: string;
        additionalContext?: string | null;
      }) => string;
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
    });

    return {
      workflowId: CV_SCORE_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: CV_SCORE_COPY_PASTE_SCHEMA_VERSION,
      prompt,
      expectedResponse: { kind: "json", envelope: true },
      privacyNotice:
        "This prompt may include CV data and context you entered. Paste it only into external tools you trust.",
    };
  }
}
