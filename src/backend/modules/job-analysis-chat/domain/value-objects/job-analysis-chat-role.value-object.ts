import { DomainError, ValueObject } from "@/backend/modules/shared";
import { ErrorCode } from "@/shared/error-codes";

export const jobAnalysisChatRoles = {
  user: "user",
  assistant: "assistant",
} as const;

export type JobAnalysisChatRolePrimitives =
  (typeof jobAnalysisChatRoles)[keyof typeof jobAnalysisChatRoles];

export class InvalidJobAnalysisChatRoleError extends DomainError {
  constructor(value: string) {
    super(ErrorCode.INVALID_JOB_ANALYSIS_CHAT_ROLE, "Analysis chat role must be user or assistant.", { value });
    this.name = "InvalidJobAnalysisChatRoleError";
  }
}

export class JobAnalysisChatRole extends ValueObject<JobAnalysisChatRolePrimitives> {
  private constructor(private readonly value: JobAnalysisChatRolePrimitives) {
    super();
  }

  static fromPrimitives(value: string): JobAnalysisChatRole {
    if (
      value !== jobAnalysisChatRoles.user &&
      value !== jobAnalysisChatRoles.assistant
    ) {
      throw new InvalidJobAnalysisChatRoleError(value);
    }

    return new JobAnalysisChatRole(value);
  }

  static user(): JobAnalysisChatRole {
    return new JobAnalysisChatRole(jobAnalysisChatRoles.user);
  }

  static assistant(): JobAnalysisChatRole {
    return new JobAnalysisChatRole(jobAnalysisChatRoles.assistant);
  }

  isUser(): boolean {
    return this.value === jobAnalysisChatRoles.user;
  }

  isAssistant(): boolean {
    return this.value === jobAnalysisChatRoles.assistant;
  }

  toPrimitives(): JobAnalysisChatRolePrimitives {
    return this.value;
  }
}
