import { describe, expect, it } from "vitest";
import { UsersPage } from "./users-page.value-object";

describe("UsersPage", () => {
  it("creates from primitives and converts back", () => {
    const primitives = {
      users: [
        {
          id: "u-1",
          email: "user1@example.com",
          createdAt: "2026-06-17T00:00:00.000Z",
        },
      ],
      page: 1,
      perPage: 20,
      total: 1,
    };
    const vo = UsersPage.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
    expect(vo.users[0].id).toBe("u-1");
    expect(vo.users[0].email).toBe("user1@example.com");
    expect(vo.page).toBe(1);
    expect(vo.perPage).toBe(20);
    expect(vo.total).toBe(1);
  });
});
