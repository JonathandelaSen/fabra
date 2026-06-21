import { OllamaCVProfileEditingAIServiceFactory } from "./infrastructure/services/ollama-cv-profile-editing-ai.service";
import { OllamaCVProfileStructuringAIServiceFactory } from "./infrastructure/services/ollama-cv-profile-structuring-ai.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { QueryBus, Telemetry, EventBus } from "@/backend/modules/shared";
import { instrumentUseCases } from "@/backend/modules/shared";
import { ApplyCVEditorCopyPasteUseCase } from "./application/use-cases/apply-cv-editor-copy-paste.use-case";
import { ApplyCVProfileStructureCopyPasteUseCase } from "./application/use-cases/apply-cv-profile-structure-copy-paste.use-case";
import { CreateTemplateCVDocumentUseCase } from "./application/use-cases/create-template-cv-document.use-case";
import { CreateTemplateVersionFromTemplateCVUseCase } from "./application/use-cases/create-template-version-from-template-cv.use-case";
import { CreateJsonResumeCVDocumentUseCase } from "./application/use-cases/create-json-resume-cv-document.use-case";
import { CreateUploadedCVDocumentUseCase } from "./application/use-cases/create-uploaded-cv-document.use-case";
import { DeleteCVDocumentUseCase } from "./application/use-cases/delete-cv-document.use-case";
import { EditCVProfileWithAIUseCase } from "./application/use-cases/edit-cv-profile-with-ai.use-case";
import { GetCVDocumentUseCase } from "./application/use-cases/get-cv-document.use-case";
import { GetCVStructuredProfileUseCase } from "./application/use-cases/get-cv-structured-profile.use-case";
import { GetPublishedCVDocumentUseCase } from "./application/use-cases/get-published-cv-document.use-case";
import { ListCVDocumentsUseCase } from "./application/use-cases/list-cv-documents.use-case";
import { PrepareCVAnalysisInputUseCase } from "./application/use-cases/prepare-cv-analysis-input.use-case";
import { RenderCVTemplatePdfUseCase } from "./application/use-cases/render-cv-template-pdf.use-case";
import { ExtractCVUploadTextUseCase } from "./application/use-cases/extract-cv-upload-text.use-case";
import { PrepareCVEditorCopyPasteUseCase } from "./application/use-cases/prepare-cv-editor-copy-paste.use-case";
import { PrepareCVProfileStructureCopyPasteUseCase } from "./application/use-cases/prepare-cv-profile-structure-copy-paste.use-case";
import { PreviewCVEditorCopyPasteUseCase } from "./application/use-cases/preview-cv-editor-copy-paste.use-case";
import { PreviewCVProfileStructureCopyPasteUseCase } from "./application/use-cases/preview-cv-profile-structure-copy-paste.use-case";
import { StructureCVProfileWithAIUseCase } from "./application/use-cases/structure-cv-profile-with-ai.use-case";
import { UpdateCVDocumentNameUseCase } from "./application/use-cases/update-cv-document-name.use-case";
import { UpdateCVDocumentExtractionUseCase } from "./application/use-cases/update-cv-document-extraction.use-case";
import { UpdateCVDocumentPublicSettingsUseCase } from "./application/use-cases/update-cv-document-public-settings.use-case";
import { UpdateTemplateCVDocumentProfileUseCase } from "./application/use-cases/update-template-cv-document-profile.use-case";
import { UpsertCVStructuredProfileUseCase } from "./application/use-cases/upsert-cv-structured-profile.use-case";
import { SupabaseCVDocumentRepository } from "./infrastructure/repositories/supabase-cv-document.repository";
import { SupabaseCVStructuredProfileRepository } from "./infrastructure/repositories/supabase-cv-structured-profile.repository";
import { SupabaseCVPublicNoteRepository } from "./infrastructure/repositories/supabase-cv-public-note.repository";
import { SupabaseCVPublicFeedbackRepository } from "./infrastructure/repositories/supabase-cv-public-feedback.repository";
import {
  DeleteCVPublicFeedbackUseCase,
  ListCVPublicFeedbackUseCase,
} from "./application/use-cases/manage-cv-public-feedback.use-case";
import {
  ListCVPublicNotesUseCase,
  ListPublishedCVPublicNotesUseCase,
  ReplaceCVPublicNotesUseCase,
} from "./application/use-cases/manage-cv-public-notes.use-case";
import { PdfTextExtractionService } from "./infrastructure/services/pdf-text-extraction.service";
import { PdfParsersService } from "./infrastructure/services/pdf-parsers.service";
import { GeminiCVProfileEditingAIServiceFactory } from "./infrastructure/services/gemini-cv-profile-editing-ai.service";
import { GeminiCVProfileStructuringAIServiceFactory } from "./infrastructure/services/gemini-cv-profile-structuring-ai.service";
import { OpenAICVProfileEditingAIServiceFactory } from "./infrastructure/services/openai-cv-profile-editing-ai.service";
import { MockCVProfileEditingAIServiceFactory } from "./infrastructure/services/mock-cv-profile-editing-ai.service";
import { MockCVProfileStructuringAIServiceFactory } from "./infrastructure/services/mock-cv-profile-structuring-ai.service";
import { OpenAICVProfileStructuringAIServiceFactory } from "./infrastructure/services/openai-cv-profile-structuring-ai.service";
import { ProviderCVProfileEditingAIServiceFactory } from "./infrastructure/services/provider-cv-profile-editing-ai-service.factory";
import { ProviderCVProfileStructuringAIServiceFactory } from "./infrastructure/services/provider-cv-profile-structuring-ai-service.factory";
import { SupabaseCVPdfStorage } from "./infrastructure/storage/supabase-cv-pdf-storage";
import { TemplateCVPdfRenderer } from "./infrastructure/renderers/template-cv-pdf-renderer";
import { CVProfileEditingCopyPastePromptService } from "./infrastructure/services/cv-profile-editing-copy-paste-prompt.service";
import { CVProfileEditingPromptService } from "./domain/services/cv-profile-editing-prompt.service";
import { CVProfileStructuringPromptService } from "./domain/services/cv-profile-structuring-prompt.service";

const documentRepo = new SupabaseCVDocumentRepository();
const profileRepo = new SupabaseCVStructuredProfileRepository();
const publicNoteRepo = new SupabaseCVPublicNoteRepository();
const publicFeedbackRepo = new SupabaseCVPublicFeedbackRepository();
const pdfStorage = new SupabaseCVPdfStorage();
const pdfParsers = new PdfParsersService();
const textExtractor = new PdfTextExtractionService(pdfParsers);
const templateRenderer = new TemplateCVPdfRenderer();
const cvProfileStructuringPromptService =
  new CVProfileStructuringPromptService();
const profileStructuringAI = new ProviderCVProfileStructuringAIServiceFactory({
  geminiFactory: new GeminiCVProfileStructuringAIServiceFactory(),
  openaiFactory: new OpenAICVProfileStructuringAIServiceFactory(),
  mockFactory: new MockCVProfileStructuringAIServiceFactory(),
  ollamaFactory: new OllamaCVProfileStructuringAIServiceFactory(),
});
const profileEditingAI = new ProviderCVProfileEditingAIServiceFactory({
  geminiFactory: new GeminiCVProfileEditingAIServiceFactory(),
  openaiFactory: new OpenAICVProfileEditingAIServiceFactory(),
  mockFactory: new MockCVProfileEditingAIServiceFactory(),
  ollamaFactory: new OllamaCVProfileEditingAIServiceFactory(),
});
const profileEditingCopyPastePrompt =
  new CVProfileEditingCopyPastePromptService(
    new CVProfileEditingPromptService(),
  );

function createUseCases(queryBus: QueryBus, eventBus: EventBus) {
  const prepareCVAnalysisInput = new PrepareCVAnalysisInputUseCase({
    documentRepo,
    pdfStorage,
    textExtractor,
    templateRenderer,
    eventBus,
  });
  const createTemplateCVDocument = new CreateTemplateCVDocumentUseCase({
    documentRepo,
    eventBus,
  });
  const upsertCVStructuredProfile = new UpsertCVStructuredProfileUseCase({
    profileRepo,
    eventBus,
  });

  return {
    listCVDocuments: new ListCVDocumentsUseCase({ documentRepo }),
    getCVDocument: new GetCVDocumentUseCase({ documentRepo }),
    renderCVTemplatePdf: new RenderCVTemplatePdfUseCase({ templateRenderer }),
    extractCVUploadText: new ExtractCVUploadTextUseCase({ textExtractor }),
    createJsonResumeCVDocument: new CreateJsonResumeCVDocumentUseCase({
      documentRepo,
      pdfStorage,
      eventBus,
    }),
    createUploadedCVDocument: new CreateUploadedCVDocumentUseCase({
      documentRepo,
      eventBus,
    }),
    createTemplateCVDocument,
    createTemplateVersionFromTemplateCV:
      new CreateTemplateVersionFromTemplateCVUseCase({
        documentRepo,
        createTemplateDocument: createTemplateCVDocument,
      }),
    updateCVDocumentName: new UpdateCVDocumentNameUseCase({
      documentRepo,
      eventBus,
    }),
    updateCVDocumentExtraction: new UpdateCVDocumentExtractionUseCase({
      documentRepo,
      eventBus,
    }),
    prepareCVAnalysisInput,
    updateCVDocumentPublicSettings: new UpdateCVDocumentPublicSettingsUseCase({
      documentRepo,
      eventBus,
    }),
    updateTemplateCVDocumentProfile: new UpdateTemplateCVDocumentProfileUseCase(
      {
        documentRepo,
        eventBus,
      },
    ),
    deleteCVDocument: new DeleteCVDocumentUseCase({
      documentRepo,
      queryBus,
      eventBus,
    }),
    getPublishedCVDocument: new GetPublishedCVDocumentUseCase({ documentRepo }),
    listCVPublicNotes: new ListCVPublicNotesUseCase(publicNoteRepo),
    listPublishedCVPublicNotes: new ListPublishedCVPublicNotesUseCase(
      publicNoteRepo,
    ),
    replaceCVPublicNotes: new ReplaceCVPublicNotesUseCase(publicNoteRepo),
    listCVPublicFeedback: new ListCVPublicFeedbackUseCase(publicFeedbackRepo),
    deleteCVPublicFeedback: new DeleteCVPublicFeedbackUseCase(
      publicFeedbackRepo,
    ),
    getCVStructuredProfile: new GetCVStructuredProfileUseCase({ profileRepo }),
    structureCVProfileWithAI: new StructureCVProfileWithAIUseCase({
      aiFactory: profileStructuringAI,
      eventBus,
    }),
    editCVProfileWithAI: new EditCVProfileWithAIUseCase({
      aiFactory: profileEditingAI,
      eventBus,
    }),
    upsertCVStructuredProfile,
    prepareCVEditorCopyPaste: new PrepareCVEditorCopyPasteUseCase({
      documentRepo,
      promptService: profileEditingCopyPastePrompt,
    }),
    previewCVEditorCopyPaste: new PreviewCVEditorCopyPasteUseCase({
      documentRepo,
    }),
    applyCVEditorCopyPaste: new ApplyCVEditorCopyPasteUseCase({
      documentRepo,
      updateProfile: new UpdateTemplateCVDocumentProfileUseCase({
        documentRepo,
        eventBus,
      }),
    }),
    prepareCVProfileStructureCopyPaste:
      new PrepareCVProfileStructureCopyPasteUseCase({
        documentRepo,
        prepareAnalysisInput: prepareCVAnalysisInput,
        buildPrompt: (input) =>
          cvProfileStructuringPromptService.buildForClipboard(input),
      }),
    previewCVProfileStructureCopyPaste:
      new PreviewCVProfileStructureCopyPasteUseCase({
        documentRepo,
      }),
    applyCVProfileStructureCopyPaste:
      new ApplyCVProfileStructureCopyPasteUseCase({
        documentRepo,
        prepareAnalysisInput: prepareCVAnalysisInput,
        upsertProfile: upsertCVStructuredProfile,
        createTemplateDocument: createTemplateCVDocument,
      }),
  };
}

export type CVLibraryModule = ReturnType<typeof createUseCases> & {
  bindRequest(client: SupabaseClient): CVLibraryModule;
};

export function createCVLibraryModule(
  queryBus: QueryBus,
  telemetry: Telemetry,
  eventBus: EventBus,
): CVLibraryModule {
  const useCases = instrumentUseCases(
    "cv-library",
    createUseCases(queryBus, eventBus),
    telemetry,
  );
  return {
    ...useCases,
    bindRequest(client: SupabaseClient) {
      documentRepo.bindRequest(client);
      profileRepo.bindRequest(client);
      publicNoteRepo.bindRequest(client);
      publicFeedbackRepo.bindRequest(client);
      pdfStorage.bindRequest(client);
      return this;
    },
  };
}
