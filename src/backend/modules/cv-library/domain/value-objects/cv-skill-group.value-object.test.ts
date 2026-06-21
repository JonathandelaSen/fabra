import { describe, expect, it } from "vitest";
import { CVSkillGroup } from "./cv-skill-group.value-object";

describe("CVSkillGroup", () => {
  it("round-trips name and items", () => {
    const primitives = { id: "s-1", name: "Languages", items: ["TS", "Go"] };
    expect(CVSkillGroup.fromPrimitives(primitives).toPrimitives()).toEqual(
      primitives,
    );
  });

  it("omits empty item arrays", () => {
    expect(CVSkillGroup.fromPrimitives({ id: "s-2" }).toPrimitives()).toEqual({
      id: "s-2",
    });
  });
});
