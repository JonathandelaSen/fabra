import { describe, expect, it } from "vitest";
import { InvalidUserEmailError, UserEmail } from "./user-email.value-object";

describe("UserEmail", () => {
  it("round-trips through primitives", () => {
    const email = UserEmail.fromPrimitives("someone@example.com");
    expect(email.toPrimitives()).toBe("someone@example.com");
  });

  it("rejects empty values", () => {
    expect(() => UserEmail.fromPrimitives("  ")).toThrow(InvalidUserEmailError);
  });
});
