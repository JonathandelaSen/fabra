import type { Analysis, CVRecord } from "@/lib/analysis-types";
import { CopyPastePreparation, UserId } from "@/backend/modules/shared";
import type { ProcessQuestionRepository } from "../../domain/repositories/process-question.repository";
import { ProcessQuestionId } from "../../domain/value-objects/process-question-id.value-object";
import type { CopyPastePrepareMode } from "../selection-process-copy-paste.constants";
import { InterviewQuestionPromptService } from "../../domain/services/interview-question-prompt.service";

const promptService = new InterviewQuestionPromptService();

export interface PrepareQuestionAnswerCopyPasteInput {
  id: string;
  userId: string;
  mode: CopyPastePrepareMode;
  instruction?: string | null;
  cv?: CVRecord | null;
  cvText?: string | null;
  analysis?: Analysis | null;
  requestId: string;
}

export class PrepareQuestionAnswerCopyPasteUseCase {
  constructor(
    private readonly deps: {
      questionRepo: ProcessQuestionRepository;
    },
  ) {}

  async execute(
    input: PrepareQuestionAnswerCopyPasteInput,
  ): Promise<CopyPastePreparation | null> {
    const id = ProcessQuestionId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const readModel = await this.deps.questionRepo.findById(id, userId);
    if (!readModel) return null;

    const primitives = readModel.question.toPrimitives();

    const prompt = promptService.buildForClipboard({
      question: primitives.question,
      context: primitives.context ?? "",
      currentAnswer: input.mode === "edit" ? primitives.answer : null,
      instruction: input.mode === "edit" ? input.instruction : null,
      cv: input.cv,
      cvText: input.cvText,
      analysis: input.analysis,
    });

    return CopyPastePreparation.fromPrimitives({
      workflowId: "interview_question.answer",
      schemaVersion: "1",
      prompt,
      expectedResponse: { kind: "plain_text", envelope: null },
      privacyNotice:
        "This prompt may include CV, offer, and interview data. Paste it only into external AI tools you trust.",
      interactionId: null,
      attemptId: null,
    });
  }
}
