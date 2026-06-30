import { OllamaInterviewQuestionAIServiceFactory } from "./infrastructure/services/ollama-interview-question-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { instrumentUseCases, type Telemetry, type EventBus } from "@/backend/modules/shared";
import { CreateProcessQuestionUseCase } from "./application/use-cases/create-process-question.use-case";
import { DeleteProcessQuestionUseCase } from "./application/use-cases/delete-process-question.use-case";
import { EditQuestionAnswerUseCase } from "./application/use-cases/edit-question-answer.use-case";
import { GenerateQuestionAnswerUseCase } from "./application/use-cases/generate-question-answer.use-case";
import { GetProcessQuestionUseCase } from "./application/use-cases/get-process-question.use-case";
import { ListProcessQuestionsUseCase } from "./application/use-cases/list-process-questions.use-case";
import { CreateFollowUpEntryByAnalysisUseCase } from "./application/use-cases/create-follow-up-entry-by-analysis.use-case";
import { DeleteFollowUpEntryByAnalysisUseCase } from "./application/use-cases/delete-follow-up-entry-by-analysis.use-case";
import { GetFollowUpTrackingByAnalysisUseCase } from "./application/use-cases/get-follow-up-tracking-by-analysis.use-case";
import { ListFollowUpTrackingByAnalysesUseCase } from "./application/use-cases/list-follow-up-tracking-by-analyses.use-case";
import { UpdateFollowUpEntryByAnalysisUseCase } from "./application/use-cases/update-follow-up-entry-by-analysis.use-case";
import { PrepareQuestionAnswerCopyPasteUseCase } from "./application/use-cases/prepare-question-answer-copy-paste.use-case";
import { UpdateProcessQuestionUseCase } from "./application/use-cases/update-process-question.use-case";
import { CreateOpportunityPersonByAnalysisUseCase } from "./application/use-cases/create-opportunity-person-by-analysis.use-case";
import { DeleteOpportunityPersonByAnalysisUseCase } from "./application/use-cases/delete-opportunity-person-by-analysis.use-case";
import { ListOpportunityPeopleByAnalysisUseCase } from "./application/use-cases/list-opportunity-people-by-analysis.use-case";
import { ListOpportunityPeopleForChatUseCase } from "./application/use-cases/list-opportunity-people-for-chat.use-case";
import { UpdateOpportunityPersonByAnalysisUseCase } from "./application/use-cases/update-opportunity-person-by-analysis.use-case";
import { SupabaseFollowUpRepository } from "./infrastructure/repositories/supabase-follow-up.repository";
import { SupabaseFollowUpEntryRepository } from "./infrastructure/repositories/supabase-follow-up-entry.repository";
import { SupabaseProcessQuestionRepository } from "./infrastructure/repositories/supabase-process-question.repository";
import { SupabaseOpportunityPersonRepository } from "./infrastructure/repositories/supabase-opportunity-person.repository";
import { GeminiInterviewQuestionAIServiceFactory } from "./infrastructure/services/gemini-interview-question-ai.service";
import { MockInterviewQuestionAIServiceFactory } from "./infrastructure/services/mock-interview-question-ai.service";
import { OpenAIInterviewQuestionAIServiceFactory } from "./infrastructure/services/openai-interview-question-ai.service";
import { ProviderInterviewQuestionAIServiceFactory } from "./infrastructure/services/provider-interview-question-ai-service.factory";

const questionRepo = new SupabaseProcessQuestionRepository();
const followUpRepo = new SupabaseFollowUpRepository();
const followUpEntryRepo = new SupabaseFollowUpEntryRepository();
const opportunityPersonRepo = new SupabaseOpportunityPersonRepository();
const aiFactory = new ProviderInterviewQuestionAIServiceFactory({
  geminiFactory: new GeminiInterviewQuestionAIServiceFactory(),
  openaiFactory: new OpenAIInterviewQuestionAIServiceFactory(),
  mockFactory: new MockInterviewQuestionAIServiceFactory(),
  ollamaFactory: new OllamaInterviewQuestionAIServiceFactory(),
});

function createUseCases(eventBus: EventBus) {
  const listOpportunityPeopleByAnalysis =
    new ListOpportunityPeopleByAnalysisUseCase({
      followUpRepo,
      personRepo: opportunityPersonRepo,
    });
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
    createFollowUpEntryByAnalysis: new CreateFollowUpEntryByAnalysisUseCase({
      followUpRepo,
      entryRepo: followUpEntryRepo,
      eventBus,
    }),
    getFollowUpTrackingByAnalysis: new GetFollowUpTrackingByAnalysisUseCase({
      followUpRepo,
      entryRepo: followUpEntryRepo,
    }),
    listFollowUpTrackingByAnalyses: new ListFollowUpTrackingByAnalysesUseCase({
      followUpRepo,
      entryRepo: followUpEntryRepo,
    }),
    updateFollowUpEntryByAnalysis: new UpdateFollowUpEntryByAnalysisUseCase({
      followUpRepo,
      entryRepo: followUpEntryRepo,
      eventBus,
    }),
    deleteFollowUpEntryByAnalysis: new DeleteFollowUpEntryByAnalysisUseCase({
      followUpRepo,
      entryRepo: followUpEntryRepo,
    }),
    deleteProcessQuestion: new DeleteProcessQuestionUseCase({
      questionRepo,
      eventBus,
    }),
    prepareQuestionAnswerCopyPaste: new PrepareQuestionAnswerCopyPasteUseCase({
      questionRepo,
    }),
    listOpportunityPeopleByAnalysis,
    listOpportunityPeopleForChat: new ListOpportunityPeopleForChatUseCase(
      listOpportunityPeopleByAnalysis,
    ),
    createOpportunityPersonByAnalysis:
      new CreateOpportunityPersonByAnalysisUseCase({
        followUpRepo,
        personRepo: opportunityPersonRepo,
        eventBus,
      }),
    updateOpportunityPersonByAnalysis:
      new UpdateOpportunityPersonByAnalysisUseCase({
        followUpRepo,
        personRepo: opportunityPersonRepo,
        eventBus,
      }),
    deleteOpportunityPersonByAnalysis:
      new DeleteOpportunityPersonByAnalysisUseCase({
        followUpRepo,
        personRepo: opportunityPersonRepo,
        eventBus,
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
      followUpEntryRepo.bindRequest(client);
      opportunityPersonRepo.bindRequest(client);
      return this;
    },
  };
}
