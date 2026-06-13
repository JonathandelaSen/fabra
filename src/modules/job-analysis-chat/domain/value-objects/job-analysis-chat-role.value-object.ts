import { ValueObject } from "@/modules/shared";

export type JobAnalysisChatRolePrimitives = "user" | "assistant";

export class JobAnalysisChatRole extends ValueObject<JobAnalysisChatRolePrimitives> {
  private constructor(private readonly value: JobAnalysisChatRolePrimitives) {
    super();
  }

  static fromPrimitives(value: string): JobAnalysisChatRole {
    if (value !== "user" && value !== "assistant") {
      throw new Error("Analysis chat role must be user or assistant.");
    }

    return new JobAnalysisChatRole(value);
  }

  static user(): JobAnalysisChatRole {
    return new JobAnalysisChatRole("user");
  }

  static assistant(): JobAnalysisChatRole {
    return new JobAnalysisChatRole("assistant");
  }

  toPrimitives(): JobAnalysisChatRolePrimitives {
    return this.value;
  }
}
