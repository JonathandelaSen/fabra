import { describe, expect, it } from "vitest";
import { JobAnalysisChatSnapshot } from "./job-analysis-chat-snapshot.value-object";

describe("JobAnalysisChatSnapshot", () => {
  it("round-trips an arbitrary snapshot payload", () => {
    const payload = { turns: 3, lastModel: "gemini" };
    expect(JobAnalysisChatSnapshot.fromPrimitives(payload).toPrimitives()).toEqual(payload);
  });

  it("round-trips null", () => {
    expect(JobAnalysisChatSnapshot.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
