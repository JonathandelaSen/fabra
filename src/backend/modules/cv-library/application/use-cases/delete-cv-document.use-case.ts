import {
  ListCVAnalysisUsageByDocumentQuery,
  type ListCVAnalysisUsageByDocumentResult,
} from "@/backend/modules/cv-analysis";
import { ListJobMatchAnalysisUsageByDocumentQuery } from "@/backend/modules/job-match-analysis";
import { UserId, type EventBus, type QueryBus } from "@/backend/modules/shared";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVDeletionOutcome } from "../../domain/value-objects/cv-deletion-outcome.value-object";
import { CVPdfStoragePath } from "../../domain/value-objects/cv-pdf-storage-path.value-object";

export interface DeleteCVDocumentInput {
  id: string;
  userId: string;
}

export class DeleteCVDocumentUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      queryBus: QueryBus;
      eventBus: EventBus;
    },
  ) {}

  async execute(input: DeleteCVDocumentInput): Promise<CVDeletionOutcome> {
    const id = CVDocumentId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const document = await this.deps.documentRepo.findById(id, userId);
    if (!document) return CVDeletionOutcome.notFound();

    if (document.type === "uploaded") {
      const [cvAnalyses, jobMatchAnalyses] = await Promise.all([
        this.deps.queryBus.execute<ListCVAnalysisUsageByDocumentResult[]>(
          new ListCVAnalysisUsageByDocumentQuery({
            cvDocumentId: input.id,
            userId: input.userId,
          }),
        ),
        this.deps.queryBus.execute<ListCVAnalysisUsageByDocumentResult[]>(
          new ListJobMatchAnalysisUsageByDocumentQuery({
            cvDocumentId: input.id,
            userId: input.userId,
          }),
        ),
      ]);
      const analyses = [...cvAnalyses, ...jobMatchAnalyses].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
      if (analyses.length > 0) return CVDeletionOutcome.inUse(analyses);
    }

    if (document.pdfStoragePath) {
      await this.deps.documentRepo.deleteStoredPdf(
        CVPdfStoragePath.fromPrimitives(document.pdfStoragePath),
      );
    }
    document.delete();
    await this.deps.documentRepo.delete(id, userId);

    const events = document.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return CVDeletionOutcome.deleted();
  }
}
