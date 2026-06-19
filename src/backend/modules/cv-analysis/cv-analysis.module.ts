import { OllamaCVScoringAIServiceFactory } from "./infrastructure/services/ollama-cv-scoring-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { instrumentUseCases, type Telemetry, type EventBus } from "@/backend/modules/shared";
import { ApplyCVScoreCopyPasteUseCase } from "./application/use-cases/apply-cv-score-copy-paste.use-case";
import { CreateCVAnalysisUseCase } from "./application/use-cases/create-cv-analysis.use-case";
import { DeleteCVAnalysisUseCase } from "./application/use-cases/delete-cv-analysis.use-case";
import { GetCVAnalysisByIdUseCase } from "./application/use-cases/get-cv-analysis-by-id.use-case";
import { ListCVAnalysesUseCase } from "./application/use-cases/list-cv-analyses.use-case";
import { ListCVAnalysisUsageByDocumentUseCase } from "./application/use-cases/list-cv-analysis-usage-by-document.use-case";
import { PrepareCVScoreCopyPasteUseCase } from "./application/use-cases/prepare-cv-score-copy-paste.use-case";
import { PreviewCVScoreCopyPasteUseCase } from "./application/use-cases/preview-cv-score-copy-paste.use-case";
import { ScoreCVAnalysisUseCase } from "./application/use-cases/score-cv-analysis.use-case";
import { UpdateCVAnalysisAIResultUseCase } from "./application/use-cases/update-cv-analysis-ai-result.use-case";
import { buildCVScoringCopyPastePrompt, buildGeneralScoringPrompt } from "./infrastructure/services/cv-scoring-prompts";
import { GeminiCVScoringAIServiceFactory } from "./infrastructure/services/gemini-cv-scoring-ai.service";
import { MockCVScoringAIServiceFactory } from "./infrastructure/services/mock-cv-scoring-ai.service";
import { OpenAICVScoringAIServiceFactory } from "./infrastructure/services/openai-cv-scoring-ai.service";
import { ProviderCVScoringAIServiceFactory } from "./infrastructure/services/provider-cv-scoring-ai-service.factory";
import { SupabaseCVAnalysisRepository } from "./infrastructure/repositories/supabase-cv-analysis.repository";

const repo = new SupabaseCVAnalysisRepository();
const aiServiceFactory = new ProviderCVScoringAIServiceFactory({
  geminiFactory: new GeminiCVScoringAIServiceFactory(),
  openaiFactory: new OpenAICVScoringAIServiceFactory(),
  mockFactory: new MockCVScoringAIServiceFactory(),
  ollamaFactory: new OllamaCVScoringAIServiceFactory(),
});

function createUseCases(eventBus: EventBus) {
  return {
    createCVAnalysis: new CreateCVAnalysisUseCase({ repo, eventBus }),
    listCVAnalyses: new ListCVAnalysesUseCase({ repo }),
    listCVAnalysisUsageByDocument: new ListCVAnalysisUsageByDocumentUseCase({
      repo,
    }),
    getCVAnalysisById: new GetCVAnalysisByIdUseCase({ repo }),
    scoreCVAnalysis: new ScoreCVAnalysisUseCase({
      repo,
      aiServiceFactory,
      eventBus,
      buildPrompt: buildGeneralScoringPrompt,
    }),
    prepareCVScoreCopyPaste: new PrepareCVScoreCopyPasteUseCase({
      repo,
      buildPrompt: buildCVScoringCopyPastePrompt,
      eventBus,
    }),
    previewCVScoreCopyPaste: new PreviewCVScoreCopyPasteUseCase({
      repo,
      eventBus,
    }),
    applyCVScoreCopyPaste: new ApplyCVScoreCopyPasteUseCase({
      repo,
      eventBus,
    }),
    updateCVAnalysisAIResult: new UpdateCVAnalysisAIResultUseCase({ repo, eventBus }),
    deleteCVAnalysis: new DeleteCVAnalysisUseCase({ repo }),
  };
}

export type CVAnalysisModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): CVAnalysisModule;
};

export function createCVAnalysisModule(telemetry: Telemetry, eventBus: EventBus): CVAnalysisModule {
  const useCases = instrumentUseCases("cv-analysis", createUseCases(eventBus), telemetry);
  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      repo.bindRequest(client);
      return this;
    },
  };
}
