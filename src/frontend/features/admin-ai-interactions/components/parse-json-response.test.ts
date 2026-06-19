import { describe, expect, it } from "vitest";
import { parseJSONResponse } from "./parse-json-response";

describe("parseJSONResponse", () => {
  it("parses strict JSON", () => {
    expect(parseJSONResponse('{"workflowId":"cv_analysis.score","result":{"score":74}}')).toEqual({
      workflowId: "cv_analysis.score",
      result: { score: 74 },
    });
  });

  it("repairs almost-valid JSON", () => {
    expect(parseJSONResponse('{"workflowId":"cv_analysis.score","result":{"score":74,},}')).toEqual({
      workflowId: "cv_analysis.score",
      result: { score: 74 },
    });
  });

  it("parses fenced and double-serialized JSON", () => {
    expect(parseJSONResponse('```json\n"{\\"result\\":{\\"score\\":74}}"\n```')).toEqual({
      result: { score: 74 },
    });
  });

  it("returns null for plain text", () => {
    expect(parseJSONResponse("This is not JSON")).toBeNull();
  });
});
