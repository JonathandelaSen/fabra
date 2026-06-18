import { describe, expect, it } from "vitest";
import { parseCVInlineMarkdown } from "./cv-inline-markdown";

describe("parseCVInlineMarkdown", () => {
  it("keeps plain text unchanged", () => {
    expect(parseCVInlineMarkdown("Plain CV text")).toEqual([
      { type: "text", text: "Plain CV text" },
    ]);
  });

  it("parses bold, italic, and bold italic markers", () => {
    expect(parseCVInlineMarkdown("Built **platforms**, *tools*, and ***systems***.")).toEqual([
      { type: "text", text: "Built " },
      { type: "strong", text: "platforms" },
      { type: "text", text: ", " },
      { type: "emphasis", text: "tools" },
      { type: "text", text: ", and " },
      { type: "strongEmphasis", text: "systems" },
      { type: "text", text: "." },
    ]);
  });

  it("parses explicit http links", () => {
    expect(parseCVInlineMarkdown("See [portfolio](https://example.com).")).toEqual([
      { type: "text", text: "See " },
      { type: "link", text: "portfolio", href: "https://example.com" },
      { type: "text", text: "." },
    ]);
  });

  it("leaves incomplete markdown literal", () => {
    expect(parseCVInlineMarkdown("This is **not closed and [link](nope)")).toEqual([
      { type: "text", text: "This is **not closed and [link](nope)" },
    ]);
  });

  it("leaves HTML as literal text", () => {
    expect(parseCVInlineMarkdown("<strong>no html</strong>")).toEqual([
      { type: "text", text: "<strong>no html</strong>" },
    ]);
  });

  it("defines ambiguous nested markers as literal text", () => {
    expect(parseCVInlineMarkdown("***AI **workflow** systems***")).toEqual([
      { type: "text", text: "***AI **workflow** systems***" },
    ]);
  });
});
