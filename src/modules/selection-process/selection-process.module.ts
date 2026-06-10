import { OllamaInterviewQuestionAIServiceFactory } from "./infrastructure/services/ollama-interview-question-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { instrumentUseCases, type Telemetry, type EventBus } from "@/modules/shared";
import { CreateProcessQuestionUseCase } from "./application/use-cases/create-process-question.use-case";
import { DeleteProcessQuestionUseCase } from "./application/use-cases/delete-process-question.use-case";
import { EditQuestionAnswerUseCase } from "./application/use-cases/edit-question-answer.use-case";
import { GenerateQuestionAnswerUseCase } from "./application/use-cases/generate-question-answer.use-case";
import { GetProcessQuestionUseCase } from "./application/use-cases/get-process-question.use-case";
import { ListProcessQuestionsUseCase } from "./application/use-cases/list-process-questions.use-case";
import { UpdateFollowUpByAnalysisUseCase } from "./application/use-cases/update-follow-up-by-analysis.use-case";
import { PrepareQuestionAnswerCopyPasteUseCase } from "./application/use-cases/prepare-question-answer-copy-paste.use-case";
import { UpdateProcessQuestionUseCase } from "./application/use-cases/update-process-question.use-case";
import { SupabaseFollowUpRepository } from "./infrastructure/repositories/supabase-follow-up.repository";
import { SupabaseProcessQuestionRepository } from "./infrastructure/repositories/supabase-process-question.repository";
import { GeminiInterviewQuestionAIServiceFactory } from "./infrastructure/services/gemini-interview-question-ai.service";
import { MockInterviewQuestionAIServiceFactory } from "./infrastructure/services/mock-interview-question-ai.service";
import { OpenAIInterviewQuestionAIServiceFactory } from "./infrastructure/services/openai-interview-question-ai.service";
import { ProviderInterviewQuestionAIServiceFactory } from "./infrastructure/services/provider-interview-question-ai-service.factory";

const questionRepo = new SupabaseProcessQuestionRepository();
const followUpRepo = new SupabaseFollowUpRepository();
const aiFactory = new ProviderInterviewQuestionAIServiceFactory({
  geminiFactory: new GeminiInterviewQuestionAIServiceFactory(),
  openaiFactory: new OpenAIInterviewQuestionAIServiceFactory(),
  mockFactory: new MockInterviewQuestionAIServiceFactory(),
  ollamaFactory: new OllamaInterviewQuestionAIServiceFactory(),
});

function createUseCases(eventBus: EventBus) {
  return {
    listProcessQuestions: new ListProcessQuestionsUseCase({ questionRepo }),
    getProcessQuestion: new GetProcessQuestionUseCase({ questionRepo }),
    createProcessQuestion: new CreateProcessQuestionUseCase({
      questionRepo,
      eventBus,
    }),
    updateProcessQuestion: new UpdateProcessQuestionUseCase({
      questionRepo,
      eventBus,
    }),
    generateQuestionAnswer: new GenerateQuestionAnswerUseCase({
      questionRepo,
      aiFactory,
      eventBus,
    }),
    editQuestionAnswer: new EditQuestionAnswerUseCase({
      questionRepo,
      aiFactory,
      eventBus,
    }),
    updateFollowUpByAnalysis: new UpdateFollowUpByAnalysisUseCase({
      followUpRepo,
      eventBus,
    }),
    deleteProcessQuestion: new DeleteProcessQuestionUseCase({
      questionRepo,
      eventBus,
    }),
    prepareQuestionAnswerCopyPaste: new PrepareQuestionAnswerCopyPasteUseCase({
      questionRepo,
    }),
  };
}

export type SelectionProcessModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): SelectionProcessModule;
};

export function createSelectionProcessModule(telemetry: Telemetry, eventBus: EventBus): SelectionProcessModule {
  const useCases = instrumentUseCases("selection-process", createUseCases(eventBus), telemetry);
  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      questionRepo.bindRequest(client);
      followUpRepo.bindRequest(client);
      return this;
    },
  };
}
