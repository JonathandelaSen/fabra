import { Timestamp, UserId, type EventBus } from "@/modules/shared";
import type { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CVDocumentName } from "../../domain/value-objects/cv-document-name.value-object";

export interface UpdateTemplateCVDocumentProfileInput {
  id: string;
  userId: string;
  name?: string;
  profile?: unknown;
  aiModel?: string;
  templateLocale?: string;
}

export class UpdateTemplateCVDocumentProfileUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      eventBus: EventBus;
    }
  ) {}

  async execute(
    input: UpdateTemplateCVDocumentProfileInput
  ): Promise<CVDocument | null> {
    const id = CVDocumentId.fromPrimitives(input.id);
    const userId = UserId.fromPrimitives(input.userId);
    const document = await this.deps.documentRepo.findById(id, userId);
    if (!document || document.type !== "template") return null;

    document.updateTemplateProfile({
      name: input.name ? CVDocumentName.fromPrimitives(input.name) : undefined,
      profile: input.profile,
      aiModel: input.aiModel,
      templateLocale: input.templateLocale,
      updatedAt: Timestamp.fromPrimitives(new Date().toISOString()),
    });
    const saved = await this.deps.documentRepo.save(document);

    const events = document.pullDomainEvents();
    await this.deps.eventBus.publish(events);

    return saved;
  }
}
