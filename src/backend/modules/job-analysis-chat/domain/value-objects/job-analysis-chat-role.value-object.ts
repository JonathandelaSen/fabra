import { ValueObject } from "@/backend/modules/shared";

export const jobAnalysisChatRoles = {
  user: "user",
  assistant: "assistant",
} as const;

export type JobAnalysisChatRolePrimitives =
  (typeof jobAnalysisChatRoles)[keyof typeof jobAnalysisChatRoles];

export class JobAnalysisChatRole extends ValueObject<JobAnalysisChatRolePrimitives> {
  private constructor(private readonly value: JobAnalysisChatRolePrimitives) {
    super();
  }

  static fromPrimitives(value: string): JobAnalysisChatRole {
    if (
      value !== jobAnalysisChatRoles.user &&
      value !== jobAnalysisChatRoles.assistant
    ) {
      throw new Error("Analysis chat role must be user or assistant.");
    }

    return new JobAnalysisChatRole(value);
  }

  static user(): JobAnalysisChatRole {
    return new JobAnalysisChatRole(jobAnalysisChatRoles.user);
  }

  static assistant(): JobAnalysisChatRole {
    return new JobAnalysisChatRole(jobAnalysisChatRoles.assistant);
  }

  toPrimitives(): JobAnalysisChatRolePrimitives {
    return this.value;
  }
}
