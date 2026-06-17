import type { AnalysisSummary } from "@/lib/analysis-types";
import { ValueObject } from "@/modules/shared";
import {
  DeleteCVDocumentStatus,
  type DeleteCVDocumentStatusPrimitives,
} from "./delete-cv-document-status.value-object";

export interface DeleteCVDocumentResultPrimitives {
  status: DeleteCVDocumentStatusPrimitives;
  analyses: AnalysisSummary[];
}

export class DeleteCVDocumentResult extends ValueObject<DeleteCVDocumentResultPrimitives> {
  private constructor(
    private readonly statusValue: DeleteCVDocumentStatus,
    private readonly analysesValue: AnalysisSummary[]
  ) {
    super();
  }

  static deleted(): DeleteCVDocumentResult {
    return new DeleteCVDocumentResult(DeleteCVDocumentStatus.deleted(), []);
  }

  static notFound(): DeleteCVDocumentResult {
    return new DeleteCVDocumentResult(DeleteCVDocumentStatus.notFound(), []);
  }

  static inUse(analyses: AnalysisSummary[]): DeleteCVDocumentResult {
    return new DeleteCVDocumentResult(DeleteCVDocumentStatus.inUse(), analyses);
  }

  static fromPrimitives(
    primitives: DeleteCVDocumentResultPrimitives
  ): DeleteCVDocumentResult {
    return new DeleteCVDocumentResult(
      DeleteCVDocumentStatus.fromPrimitives(primitives.status),
      primitives.analyses
    );
  }

  toPrimitives(): DeleteCVDocumentResultPrimitives {
    return {
      status: this.statusValue.toPrimitives(),
      analyses: this.analysesValue,
    };
  }

  get status(): DeleteCVDocumentStatus {
    return this.statusValue;
  }

  get analyses(): AnalysisSummary[] {
    return this.analysesValue;
  }
}
