import { EntityId, LongText, ValueObject } from "@/backend/modules/shared";

export interface EvalArtifactSaveResultPrimitives {
  caseId: string;
  casePath: string;
  runPath: string | null;
  resultPath: string | null;
}

export class EvalArtifactSaveResult extends ValueObject<EvalArtifactSaveResultPrimitives> {
  private constructor(
    private readonly caseIdVo: EntityId,
    private readonly casePathVo: LongText,
    private readonly runPathVo: LongText | null,
    private readonly resultPathVo: LongText | null,
  ) {
    super();
  }

  static fromPrimitives(value: EvalArtifactSaveResultPrimitives): EvalArtifactSaveResult {
    return new EvalArtifactSaveResult(
      EntityId.fromPrimitives(value.caseId),
      LongText.fromPrimitives(value.casePath),
      value.runPath === null ? null : LongText.fromPrimitives(value.runPath),
      value.resultPath === null ? null : LongText.fromPrimitives(value.resultPath),
    );
  }

  toPrimitives(): EvalArtifactSaveResultPrimitives {
    return {
      caseId: this.caseIdVo.toPrimitives(),
      casePath: this.casePathVo.toPrimitives(),
      runPath: this.runPathVo?.toPrimitives() ?? null,
      resultPath: this.resultPathVo?.toPrimitives() ?? null,
    };
  }
}
