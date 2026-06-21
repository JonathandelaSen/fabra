import { ErrorCode } from "@/shared/error-codes";
import { badRequest, notFound, UserId } from "@/backend/modules/shared";
import {
  CV_TEMPLATES,
  getCVTemplate,
  type CVTemplateLocale,
} from "../../domain/cv-templates";
import type { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import { CVDocumentId } from "../../domain/value-objects/cv-document-id.value-object";
import { CreateTemplateCVDocumentUseCase } from "./create-template-cv-document.use-case";

export interface CreateTemplateVersionFromTemplateCVInput {
  id: string;
  userId: string;
  templateId: string;
  templateLocale: string;
}

function stripTrailingTemplateName(name: string): string {
  const knownNames = new Set(
    CV_TEMPLATES.map((template) => template.name.toLowerCase()),
  );
  const parts = name
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) return name.trim();
  const last = parts[parts.length - 1]?.toLowerCase();
  return last && knownNames.has(last)
    ? parts.slice(0, -1).join(" · ")
    : name.trim();
}

export class CreateTemplateVersionFromTemplateCVUseCase {
  constructor(
    private readonly deps: {
      documentRepo: CVDocumentRepository;
      createTemplateDocument: CreateTemplateCVDocumentUseCase;
    },
  ) {}

  async execute(
    input: CreateTemplateVersionFromTemplateCVInput,
  ): Promise<CVDocument> {
    const document = await this.deps.documentRepo.findById(
      CVDocumentId.fromPrimitives(input.id),
      UserId.fromPrimitives(input.userId),
    );
    if (!document) {
      throw notFound("CV not found", ErrorCode.CV_NOT_FOUND);
    }

    const primitives = document.toPrimitives();
    if (primitives.type !== "template" || !primitives.profile) {
      throw badRequest(
        "Only editable template CVs can change template without AI.",
        ErrorCode.ONLY_TEMPLATE_CVS_EDITABLE,
      );
    }

    const template = getCVTemplate(input.templateId);
    if (!template) {
      throw notFound("Template not found", ErrorCode.TEMPLATE_NOT_FOUND);
    }
    if (template.templateId === primitives.templateId) {
      throw badRequest("Choose a different template.", ErrorCode.BAD_REQUEST);
    }

    const requestedLocale = input.templateLocale as CVTemplateLocale;
    const selectedLocale = template.locales.includes(requestedLocale)
      ? requestedLocale
      : ((primitives.templateLocale as CVTemplateLocale | null) ?? "es");
    const baseName = stripTrailingTemplateName(primitives.name);

    return this.deps.createTemplateDocument.execute({
      userId: input.userId,
      sourceCvId: primitives.sourceCvId ?? primitives.id,
      name: `${baseName} · ${template.name}`,
      templateId: template.templateId,
      templateLocale: selectedLocale,
      schemaVersion: primitives.schemaVersion,
      sourceTextHash: primitives.sourceTextHash,
      aiModel: primitives.aiModel,
      profile: primitives.profile,
      filename: primitives.filename,
      textNode: primitives.extractedText.textNode,
    });
  }
}
