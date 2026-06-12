import { UserId } from "@/modules/shared";
import type { JobMatchAnalysisRepository } from "../../domain/repositories/job-match-analysis.repository";
import { JobMatchAnalysisId } from "../../domain/value-objects/job-match-analysis-id.value-object";
import {
  JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
  JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
} from "../services/job-match-score-copy-paste-result.validator";

export interface PrepareJobMatchScoreCopyPasteInput {
  id: string;
  userId: string;
  jobDescription: string;
  jobUrl?: string | null;
  language?: string | null;
}

export interface PrepareJobMatchScoreCopyPasteResult {
  workflowId: typeof JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID;
  schemaVersion: typeof JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION;
  prompt: string;
  expectedResponse: { kind: "json"; envelope: true };
  privacyNotice: string;
}

export class PrepareJobMatchScoreCopyPasteUseCase {
  constructor(
    private readonly deps: {
      repo: JobMatchAnalysisRepository;
      buildPrompt: (input: {
        text: string;
        jobDescription: string;
        jobUrl?: string | null;
        language?: string | null;
      }) => string;
    },
  ) {}

  async execute(
    input: PrepareJobMatchScoreCopyPasteInput,
  ): Promise<PrepareJobMatchScoreCopyPasteResult | null> {
    const id = JobMatchAnalysisId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const analysis = await this.deps.repo.findById(id, userId);
    if (!analysis) return null;

    const primitives = analysis.toPrimitives();
    const text =
      primitives.extractedText.textPython ||
      primitives.extractedText.textPdfjs ||
      primitives.extractedText.textNode;
    if (!text) {
      throw new Error("No extracted text available for this analysis.");
    }

    const prompt = this.deps.buildPrompt({
      text,
      jobDescription: input.jobDescription,
      jobUrl: input.jobUrl,
      language: input.language,
    });

    return {
      workflowId: JOB_MATCH_SCORE_COPY_PASTE_WORKFLOW_ID,
      schemaVersion: JOB_MATCH_SCORE_COPY_PASTE_SCHEMA_VERSION,
      prompt,
      expectedResponse: { kind: "json", envelope: true },
      privacyNotice:
        "This prompt may include CV data and context you entered. Paste it only into external tools you trust.",
    };
  }
}
