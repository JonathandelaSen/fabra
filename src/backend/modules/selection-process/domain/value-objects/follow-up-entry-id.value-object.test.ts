import { describe, expect, it } from "vitest";
import { InvalidEntityIdError } from "@/backend/modules/shared";
import { FollowUpEntryId } from "./follow-up-entry-id.value-object";

describe("FollowUpEntryId", () => {
  it("round-trips non-empty ids", () => {
    expect(FollowUpEntryId.fromPrimitives("entry-1").toPrimitives()).toBe(
      "entry-1",
    );
  });

  it("rejects empty ids", () => {
    expect(() => FollowUpEntryId.fromPrimitives(" ")).toThrow(
      InvalidEntityIdError
    );
  });
});
