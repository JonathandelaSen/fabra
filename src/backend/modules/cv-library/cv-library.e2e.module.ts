import { OllamaCVProfileStructuringAIServiceFactory } from "./infrastructure/services/ollama-cv-profile-structuring-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { QueryBus, Telemetry, EventBus } from "@/backend/modules/shared";
import { instrumentUseCases } from "@/backend/modules/shared";
import { CreateUploadedCVDocumentUseCase } from "./application/use-cases/create-uploaded-cv-document.use-case";
import { GetCVDocumentUseCase } from "./application/use-cases/get-cv-document.use-case";
import { ListCVDocumentsUseCase } from "./application/use-cases/list-cv-documents.use-case";
import { PrepareCVAnalysisInputUseCase } from "./application/use-cases/prepare-cv-analysis-input.use-case";
import { StructureCVProfileWithAIUseCase } from "./application/use-cases/structure-cv-profile-with-ai.use-case";
import { UpdateCVDocumentExtractionUseCase } from "./application/use-cases/update-cv-document-extraction.use-case";
import { UpsertCVStructuredProfileUseCase } from "./application/use-cases/upsert-cv-structured-profile.use-case";
import { SupabaseCVDocumentRepository } from "./infrastructure/repositories/supabase-cv-document.repository";
import { SupabaseCVStructuredProfileRepository } from "./infrastructure/repositories/supabase-cv-structured-profile.repository";
import { MockPdfTextExtractor } from "./infrastructure/services/mock-pdf-text-extractor.service";
import { MockCVProfileStructuringAIServiceFactory } from "./infrastructure/services/mock-cv-profile-structuring-ai.service";
import { ProviderCVProfileStructuringAIServiceFactory } from "./infrastructure/services/provider-cv-profile-structuring-ai-service.factory";
import { SupabaseCVPdfStorage } from "./infrastructure/storage/supabase-cv-pdf-storage";
import { TemplateCVPdfRenderer } from "./infrastructure/renderers/template-cv-pdf-renderer";

const documentRepo = new SupabaseCVDocumentRepository();
const profileRepo = new SupabaseCVStructuredProfileRepository();
const pdfStorage = new SupabaseCVPdfStorage();
const mockTextExtractor = new MockPdfTextExtractor();
const templateRenderer = new TemplateCVPdfRenderer();
const profileStructuringAI = new ProviderCVProfileStructuringAIServiceFactory({
  geminiFactory: new MockCVProfileStructuringAIServiceFactory() as any,
  openaiFactory: new MockCVProfileStructuringAIServiceFactory() as any,
  mockFactory: new MockCVProfileStructuringAIServiceFactory(),
  ollamaFactory: new OllamaCVProfileStructuringAIServiceFactory(),
});
// E2E module setup without event tracking

function createE2EUseCases(_queryBus: QueryBus, eventBus: EventBus) {
  return {
    listCVDocuments: new ListCVDocumentsUseCase({ documentRepo }),
    getCVDocument: new GetCVDocumentUseCase({ documentRepo }),
    createUploadedCVDocument: new CreateUploadedCVDocumentUseCase({
      documentRepo,
      eventBus,
    }),
    updateCVDocumentExtraction: new UpdateCVDocumentExtractionUseCase({
      documentRepo,
      eventBus,
    }),
    prepareCVAnalysisInput: new PrepareCVAnalysisInputUseCase({
      documentRepo,
      pdfStorage,
      textExtractor: mockTextExtractor,
      templateRenderer,
      eventBus,
    }),
    structureCVProfileWithAI: new StructureCVProfileWithAIUseCase({
      aiFactory: profileStructuringAI,
      eventBus,
    }),
    upsertCVStructuredProfile: new UpsertCVStructuredProfileUseCase({
      profileRepo,
      eventBus,
    }),
  };
}

export type CVLibraryE2EModule = ReturnType<typeof createE2EUseCases> & {
  bindRequest(client: SupabaseClient): CVLibraryE2EModule;
};

export function createCVLibraryE2EModule(
  queryBus: QueryBus,
  telemetry: Telemetry,
  eventBus: EventBus,
): CVLibraryE2EModule {
  const useCases = instrumentUseCases(
    "cv-library-e2e",
    createE2EUseCases(queryBus, eventBus),
    telemetry,
  );
  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      documentRepo.bindRequest(client);
      profileRepo.bindRequest(client);
      pdfStorage.bindRequest(client);
      return this;
    },
  };
}
