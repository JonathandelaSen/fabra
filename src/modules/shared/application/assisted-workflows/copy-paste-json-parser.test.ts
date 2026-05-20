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

  it("rejects malformed JSON", () => {
    expect(() => extractCopyPasteJson("{")).toThrow(HttpError);
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
