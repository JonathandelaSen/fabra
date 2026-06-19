import { Timestamp, UserId, type EventBus } from "@/backend/modules/shared";
import type { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";

export interface UpdateCVDocumentPublicSettingsInput {
  id: string;
  userId: string;
  publicEnabled: boolean;
  feedbackEnabled?: boolean;
  publicId: string | null;
  publicSlug: string | null;
}

export class UpdateCVDocumentPublicSettingsUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(
    input: UpdateCVDocumentPublicSettingsInput
  ): Promise<CVDocument | null> {
    const id = CVDocumentId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const document = await this.deps.documentRepo.findById(id, userId);
    if (!document || document.type !== "template") return null;

    document.updatePublicSettings({
      enabled: input.publicEnabled,
      feedbackEnabled: input.feedbackEnabled,
      publicId: input.publicId,
      slug: input.publicSlug,
      publishedAt: input.publicEnabled
        ? Timestamp.fromPrimitives(new Date().toISOString())
        : null,
    });
    const saved = await this.deps.documentRepo.save(document);

    const events = document.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
