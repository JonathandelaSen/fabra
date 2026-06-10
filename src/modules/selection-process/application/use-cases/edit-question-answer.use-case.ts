import type { Analysis, CVRecord } from "@/lib/analysis-types";
import {
  Timestamp,
  UserId,
  type AIProvider,
  type EventBus,
} from "@/modules/shared";
import type {
  ProcessQuestionReadModel,
  ProcessQuestionRepository,
} from "../../domain/repositories/process-question.repository";
import type { InterviewQuestionAIServiceFactory } from "../../domain/repositories/interview-question-ai.service";
import { ProcessQuestionId } from "../../domain/value-objects/process-question-id.value-object";

export interface EditQuestionAnswerInput {
  id: string;
  userId: string;
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  context: string;
  instruction: string;
  cv?: CVRecord | null;
  cvText?: string | null;
  analysis?: Analysis | null;
}

export class EditQuestionAnswerUseCase {
  constructor(
    private readonly deps: {
      questionRepo: ProcessQuestionRepository;
      aiFactory: InterviewQuestionAIServiceFactory;
      eventBus: EventBus;
    },
  ) {}

  async execute(
    input: EditQuestionAnswerInput,
  ): Promise<ProcessQuestionReadModel | null> {
    const id = ProcessQuestionId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const existing = await this.deps.questionRepo.findById(id, userId);
    if (!existing) return null;

    const question = existing.question.toPrimitives();

    const aiService = this.deps.aiFactory.create({
      provider: input.provider,
      apiKey: input.apiKey,
      baseUrl: input.baseUrl,
      model: input.model,
    });
    const answer = await aiService.editAnswer({
      question: question.question,
      context: input.context,
      currentAnswer: question.answer,
      instruction: input.instruction,
      cv: input.cv,
      cvText: input.cvText,
      analysis: input.analysis,
    });

    existing.question.update({
      context: input.context,
      answer,
      aiModel: input.model,
      aiGeneratedAt: new Date().toISOString(),
      updatedAt: Timestamp.fromPrimitives(new Date().toISOString()),
    });

    const saved = await this.deps.questionRepo.save(existing.question);

    const events = existing.question.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
