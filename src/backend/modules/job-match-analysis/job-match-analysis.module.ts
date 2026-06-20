import { OllamaJobMatchScoringAIServiceFactory } from "./infrastructure/services/ollama-job-match-scoring-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { instrumentUseCases, type Telemetry, type EventBus } from "@/backend/modules/shared";
import { CreateJobMatchAnalysisUseCase } from "./application/use-cases/create-job-match-analysis.use-case";
import { DeleteJobMatchAnalysisUseCase } from "./application/use-cases/delete-job-match-analysis.use-case";
import { GetJobMatchAnalysisByIdUseCase } from "./application/use-cases/get-job-match-analysis-by-id.use-case";
import { ListJobMatchAnalysesUseCase } from "./application/use-cases/list-job-match-analyses.use-case";
import { ListJobMatchAnalysisUsageByDocumentUseCase } from "./application/use-cases/list-job-match-analysis-usage-by-document.use-case";
import { ScoreJobMatchAnalysisUseCase } from "./application/use-cases/score-job-match-analysis.use-case";
import { UpdateJobMatchAnalysisAIResultUseCase } from "./application/use-cases/update-job-match-analysis-ai-result.use-case";
import { UpdateJobMatchAnalysisJobUrlUseCase } from "./application/use-cases/update-job-match-analysis-job-url.use-case";
import { PrepareJobMatchScoreCopyPasteUseCase } from "./application/use-cases/prepare-job-match-score-copy-paste.use-case";
import { PreviewJobMatchScoreCopyPasteUseCase } from "./application/use-cases/preview-job-match-score-copy-paste.use-case";
import { ApplyJobMatchScoreCopyPasteUseCase } from "./application/use-cases/apply-job-match-score-copy-paste.use-case";
import { GeminiJobMatchScoringAIServiceFactory } from "./infrastructure/services/gemini-job-match-scoring-ai.service";
import { MockJobMatchScoringAIServiceFactory } from "./infrastructure/services/mock-job-match-scoring-ai.service";
import { OpenAIJobMatchScoringAIServiceFactory } from "./infrastructure/services/openai-job-match-scoring-ai.service";
import { ProviderJobMatchScoringAIServiceFactory } from "./infrastructure/services/provider-job-match-scoring-ai-service.factory";
import { JobMatchScoringPromptService } from "./domain/services/job-match-scoring-prompt.service";
import { SupabaseJobMatchAnalysisRepository } from "./infrastructure/repositories/supabase-job-match-analysis.repository";

const repo = new SupabaseJobMatchAnalysisRepository();
const scoringPromptService = new JobMatchScoringPromptService();
const aiServiceFactory = new ProviderJobMatchScoringAIServiceFactory({
  geminiFactory: new GeminiJobMatchScoringAIServiceFactory(),
  openaiFactory: new OpenAIJobMatchScoringAIServiceFactory(),
  mockFactory: new MockJobMatchScoringAIServiceFactory(),
  ollamaFactory: new OllamaJobMatchScoringAIServiceFactory(),
});

function createUseCases(eventBus: EventBus) {
  return {
    createJobMatchAnalysis: new CreateJobMatchAnalysisUseCase({ repo, eventBus }),
    listJobMatchAnalyses: new ListJobMatchAnalysesUseCase({ repo }),
    listJobMatchAnalysisUsageByDocument:
      new ListJobMatchAnalysisUsageByDocumentUseCase({ repo }),
    getJobMatchAnalysisById: new GetJobMatchAnalysisByIdUseCase({ repo }),
    scoreJobMatchAnalysis: new ScoreJobMatchAnalysisUseCase({
      repo,
      aiServiceFactory,
      eventBus,
    }),
    updateJobMatchAnalysisAIResult: new UpdateJobMatchAnalysisAIResultUseCase({
      repo,
      eventBus,
    }),
    updateJobMatchAnalysisJobUrl: new UpdateJobMatchAnalysisJobUrlUseCase({
      repo,
      eventBus,
    }),
    deleteJobMatchAnalysis: new DeleteJobMatchAnalysisUseCase({ repo }),
    prepareJobMatchScoreCopyPaste: new PrepareJobMatchScoreCopyPasteUseCase({
      repo,
      buildPrompt: (input) => scoringPromptService.buildForClipboard(input),
    }),
    previewJobMatchScoreCopyPaste: new PreviewJobMatchScoreCopyPasteUseCase({
      repo,
    }),
    applyJobMatchScoreCopyPaste: new ApplyJobMatchScoreCopyPasteUseCase({
      repo,
      eventBus,
    }),
  };
}

export type JobMatchAnalysisModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): JobMatchAnalysisModule;
};

export function createJobMatchAnalysisModule(telemetry: Telemetry, eventBus: EventBus): JobMatchAnalysisModule {
  const useCases = instrumentUseCases("job-match-analysis", createUseCases(eventBus), telemetry);
  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      repo.bindRequest(client);
      return this;
    },
  };
}
