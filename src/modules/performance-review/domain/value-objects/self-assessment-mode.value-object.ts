import { DomainError, ValueObject } from "@/modules/shared";
import {
  ASSISTANCE_MODE,
  type AssistanceMode,
} from "@/modules/shared/application/assisted-workflows/copy-paste-workflow.types";

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
      throw new DomainError(`Invalid self-assessment mode: ${value}`);
    }
    return new SelfAssessmentMode(value as SelfAssessmentModeValue);
  }

  toPrimitives(): SelfAssessmentModeValue {
    return this.value;
  }
}
