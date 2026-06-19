import { ErrorCode } from "@/shared/error-codes";
import { DomainError, ValueObject } from "@/backend/modules/shared";
import {
  ASSISTANCE_MODE,
  type AssistanceMode,
} from "@/backend/modules/shared/application/assisted-workflows/copy-paste-workflow.types";

export const SELF_ASSESSMENT_MODES = [
  ASSISTANCE_MODE.manual,
  ASSISTANCE_MODE.copyPaste,
  ASSISTANCE_MODE.integrated,
] as const;

export type SelfAssessmentModeValue = AssistanceMode;

export class SelfAssessmentMode extends ValueObject<SelfAssessmentModeValue> {
  private constructor(private readonly value: SelfAssessmentModeValue) {
    super();
  }

  static fromPrimitives(value: string): SelfAssessmentMode {
    if (!SELF_ASSESSMENT_MODES.includes(value as SelfAssessmentModeValue)) {
      throw new DomainError(ErrorCode.VALIDATION_FAILED, `Invalid self-assessment mode: ${value}`);
    }
    return new SelfAssessmentMode(value as SelfAssessmentModeValue);
  }

  toPrimitives(): SelfAssessmentModeValue {
    return this.value;
  }
}
