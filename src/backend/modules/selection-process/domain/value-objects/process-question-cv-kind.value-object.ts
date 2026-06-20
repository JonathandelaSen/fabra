import { ValueObject } from "@/backend/modules/shared";

export const processQuestionCVTypes = {
  uploaded: "uploaded",
  template: "template",
} as const;

export type ProcessQuestionCVType =
  (typeof processQuestionCVTypes)[keyof typeof processQuestionCVTypes];

export class ProcessQuestionCVKind extends ValueObject<ProcessQuestionCVType> {
  private constructor(private readonly value: ProcessQuestionCVType) {
    super();
  }

  static fromPrimitives(value: string): ProcessQuestionCVKind {
    if (!Object.values(processQuestionCVTypes).includes(value as ProcessQuestionCVType)) {
      throw new Error(`Invalid process question CV type: ${value}`);
    }
    return new ProcessQuestionCVKind(value as ProcessQuestionCVType);
  }

  static uploaded(): ProcessQuestionCVKind {
    return new ProcessQuestionCVKind(processQuestionCVTypes.uploaded);
  }

  static template(): ProcessQuestionCVKind {
    return new ProcessQuestionCVKind(processQuestionCVTypes.template);
  }

  isUploaded(): boolean {
    return this.value === processQuestionCVTypes.uploaded;
  }

  isTemplate(): boolean {
    return this.value === processQuestionCVTypes.template;
  }

  toPrimitives(): ProcessQuestionCVType {
    return this.value;
  }
}
