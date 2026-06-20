import type { CVDocument } from "../../domain/entities/cv-document.entity";
import type { CVDocumentRepository } from "../../domain/repositories/cv-document.repository";
import { CVPublicId } from "../../domain/value-objects/cv-public-id.value-object";

export interface GetPublishedCVDocumentInput {
  publicId: string;
}

export class GetPublishedCVDocumentUseCase {
  constructor(private readonly deps: { documentRepo: CVDocumentRepository }) {}

  async execute(input: GetPublishedCVDocumentInput): Promise<CVDocument | null> {
    return this.deps.documentRepo.findPublishedByPublicId(
      CVPublicId.fromPrimitives(input.publicId),
    );
  }
}
