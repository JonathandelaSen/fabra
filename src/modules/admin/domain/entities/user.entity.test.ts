import { describe, expect, it } from "vitest";
import { User } from "./user.entity";

describe("User", () => {
  const primitives = {
    id: "11111111-1111-1111-1111-111111111111",
    email: "someone@example.com",
    createdAt: "2026-06-10T00:00:00.000Z",
  };

  it("round-trips through primitives", () => {
    const user = User.fromPrimitives(primitives);
    expect(user.toPrimitives()).toEqual(primitives);
    expect(user.id).toBe(primitives.id);
    expect(user.email).toBe(primitives.email);
  });

  it("rejects invalid primitives", () => {
    expect(() => User.fromPrimitives({ ...primitives, email: "" })).toThrow();
    expect(() => User.fromPrimitives({ ...primitives, id: "" })).toThrow();
    expect(() =>
      User.fromPrimitives({ ...primitives, createdAt: " " })
    ).toThrow();
  });

  it("does not record domain events when hydrating", () => {
    const user = User.fromPrimitives(primitives);
    expect(user.pullDomainEvents()).toEqual([]);
  });
});
