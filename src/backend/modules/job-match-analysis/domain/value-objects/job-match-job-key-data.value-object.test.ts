import { describe, expect, it } from "vitest";
import { JobMatchJobKeyData } from "./job-match-job-key-data.value-object";

describe("JobMatchJobKeyData", () => {
  it("round-trips an arbitrary payload", () => {
    const payload = { title: "Engineer", skills: ["ts", "react"] };
    expect(JobMatchJobKeyData.fromPrimitives(payload).toPrimitives()).toEqual(payload);
  });

  it("round-trips null", () => {
    expect(JobMatchJobKeyData.fromPrimitives(null).toPrimitives()).toBeNull();
  });
});
