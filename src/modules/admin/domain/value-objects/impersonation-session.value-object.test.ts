import { describe, expect, it } from "vitest";
import { ImpersonationSession } from "./impersonation-session.value-object";

describe("ImpersonationSession", () => {
  const primitives = {
    tokenHash: "abc123",
    targetUserId: "11111111-1111-1111-1111-111111111111",
    targetEmail: "target@example.com",
  };

  it("round-trips through primitives", () => {
    const session = ImpersonationSession.fromPrimitives(primitives);
    expect(session.toPrimitives()).toEqual(primitives);
    expect(session.targetUserId).toBe(primitives.targetUserId);
    expect(session.targetEmail).toBe(primitives.targetEmail);
  });

  it("rejects invalid primitives", () => {
    expect(() =>
      ImpersonationSession.fromPrimitives({ ...primitives, tokenHash: " " })
    ).toThrow("Impersonation token hash cannot be empty.");
    expect(() =>
      ImpersonationSession.fromPrimitives({ ...primitives, targetUserId: "" })
    ).toThrow();
    expect(() =>
      ImpersonationSession.fromPrimitives({ ...primitives, targetEmail: "" })
    ).toThrow();
  });
});
