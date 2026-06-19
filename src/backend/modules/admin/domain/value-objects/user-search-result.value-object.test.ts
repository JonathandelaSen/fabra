import { describe, expect, it } from "vitest";
import { UserSearchResult } from "./user-search-result.value-object";

describe("UserSearchResult", () => {
  it("can be created from primitives", () => {
    const primitives = {
      users: [],
      total: 0,
    };
    const vo = UserSearchResult.fromPrimitives(primitives);
    expect(vo.toPrimitives()).toEqual(primitives);
  });
});
