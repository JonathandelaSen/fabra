import type { Analysis, CVRecord } from "@/lib/analysis-types";
import { Timestamp, UserId, type EventTracker } from "@/modules/shared";
import { ASSISTANCE_MODE } from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";
import type { ProcessQuestionRepository } from "../../domain/repositories/process-question.repository";
import { ProcessQuestionId } from "../../domain/value-objects/process-question-id.value-object";
import { buildInterviewQuestionCopyPastePrompt } from "../services/interview-question-copy-paste-prompts";

export interface PrepareQuestionAnswerCopyPasteInput {
  id: string;
  userId: string;
  mode: "generate" | "edit";
  instruction?: string | null;
  cv?: CVRecord | null;
  cvText?: string | null;
  analysis?: Analysis | null;
  requestId: string;
}

export interface PrepareQuestionAnswerCopyPasteResult {
  workflowId: "interview_question.answer";
  schemaVersion: "1";
  prompt: string;
  expectedResponse: { kind: "plain_text" };
  privacyNotice: string;
}

export class PrepareQuestionAnswerCopyPasteUseCase {
  constructor(
    private readonly deps: {
      questionRepo: ProcessQuestionRepository;
      tracker: EventTracker;
    },
  ) {}

  async execute(
    input: PrepareQuestionAnswerCopyPasteInput,
  ): Promise<PrepareQuestionAnswerCopyPasteResult | null> {
    const id = ProcessQuestionId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const readModel = await this.deps.questionRepo.findById(id, userId);
    if (!readModel) return null;

    const primitives = readModel.question.toPrimitives();

    const prompt = buildInterviewQuestionCopyPastePrompt({
      question: primitives.question,
      context: primitives.context ?? "",
      currentAnswer: input.mode === "edit" ? primitives.answer : null,
      instruction: input.mode === "edit" ? input.instruction : null,
      cv: input.cv,
      cvText: input.cvText,
      analysis: input.analysis,
    });

    await this.deps.tracker.record({
      userId: input.userId,
      cvId: primitives.legacyCvId,
      analysisId: primitives.sourceJobMatchAnalysisId,
      requestId: input.requestId,
      stage: "interview_question_copy_paste_prompt_prepared",
      status: "success",
      source: "selection_process",
      textLength: primitives.question.length,
      metadata: {
        assistanceMode: ASSISTANCE_MODE.copyPaste,
        questionId: input.id,
        mode: input.mode,
        preparedAt: Timestamp.fromPrimitives(
          new Date().toISOString(),
        ).toPrimitives(),
      },
    });

    return {
      workflowId: "interview_question.answer",
      schemaVersion: "1",
      prompt,
      expectedResponse: { kind: "plain_text" },
      privacyNotice:
        "This prompt may include CV, offer, and interview data. Paste it only into external AI tools you trust.",
    };
  }
}
