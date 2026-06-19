import { describe, expect, it } from "vitest";
import { HttpError } from "../../infrastructure/http/api-errors";
import { extractCopyPasteJson } from "./copy-paste-json-parser";

describe("extractCopyPasteJson", () => {
  it("parses pure JSON and trims whitespace", () => {
    expect(extractCopyPasteJson('  {"ok":true}  ')).toEqual({ ok: true });
  });

  it("parses a single fenced json block", () => {
    expect(extractCopyPasteJson('```json\n{"ok":true}\n```')).toEqual({
      ok: true,
    });
  });

  it("rejects empty input", () => {
    expect(() => extractCopyPasteJson(" ")).toThrow(HttpError);
  });

  it("rejects irreparable malformed JSON", () => {
    expect(() => extractCopyPasteJson("}{")).toThrow(HttpError);
  });

  it("repairs unescaped inner quotes from LLM responses", () => {
    expect(
      extractCopyPasteJson('{"bullet":"Led the "Floating" initiative"}'),
    ).toEqual({ bullet: 'Led the "Floating" initiative' });
  });

  it("repairs trailing commas", () => {
    expect(extractCopyPasteJson('{"a":1,"b":2,}')).toEqual({ a: 1, b: 2 });
  });

  it("repairs unescaped quotes inside a fenced json block", () => {
    expect(
      extractCopyPasteJson('```json\n{"name":"the "Querix" product"}\n```'),
    ).toEqual({ name: 'the "Querix" product' });
  });

  it("rejects text before or after JSON", () => {
    expect(() => extractCopyPasteJson('Here: {"ok":true}')).toThrow(HttpError);
    expect(() => extractCopyPasteJson('{"ok":true} done')).toThrow(HttpError);
  });

  it("rejects multiple fenced blocks", () => {
    expect(() =>
      extractCopyPasteJson('```json\n{"a":1}\n```\n```json\n{"b":2}\n```'),
    ).toThrow(HttpError);
  });
});
