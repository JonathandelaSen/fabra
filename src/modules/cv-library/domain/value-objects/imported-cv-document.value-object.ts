import { StringList, ValueObject } from "@/modules/shared";
import { CVDocument, type CVDocumentPrimitives } from "../entities/cv-document.entity";

export interface ImportedCVDocumentPrimitives {
  document: CVDocumentPrimitives;
  warnings: string[];
}

export class ImportedCVDocument extends ValueObject<ImportedCVDocumentPrimitives> {
  private constructor(
    private readonly docEntity: CVDocument,
    private readonly warningsList: StringList
  ) {
    super();
  }

  static create(document: CVDocument, warnings: string[]): ImportedCVDocument {
    return new ImportedCVDocument(document, StringList.fromPrimitives(warnings));
  }

  static fromPrimitives(
    primitives: ImportedCVDocumentPrimitives
  ): ImportedCVDocument {
    return new ImportedCVDocument(
      CVDocument.fromPrimitives(primitives.document),
      StringList.fromPrimitives(primitives.warnings)
    );
  }

  toPrimitives(): ImportedCVDocumentPrimitives {
    return {
      document: this.docEntity.toPrimitives(),
      warnings: this.warningsList.toPrimitives(),
    };
  }

  get document(): CVDocument {
    return this.docEntity;
  }

  get warnings(): string[] {
    return this.warningsList.toPrimitives();
  }
}
