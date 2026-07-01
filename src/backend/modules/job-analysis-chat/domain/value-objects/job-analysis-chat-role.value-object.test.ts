import { describe, expect, it } from "vitest";
import { JobAnalysisChatRole, InvalidJobAnalysisChatRoleError } from "./job-analysis-chat-role.value-object";

describe("JobAnalysisChatRole", () => {
  it("accepts user and assistant roles", () => {
    expect(JobAnalysisChatRole.fromPrimitives("user").toPrimitives()).toBe("user");
    expect(JobAnalysisChatRole.fromPrimitives("assistant").toPrimitives()).toBe(
      "assistant",
    );
  });

  it("rejects unsupported roles", () => {
    expect(() => JobAnalysisChatRole.fromPrimitives("system")).toThrow(
      InvalidJobAnalysisChatRoleError,
    );
  });
});
