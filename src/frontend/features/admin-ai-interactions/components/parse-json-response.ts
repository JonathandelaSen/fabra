import { jsonrepair } from "jsonrepair";

const FENCED_JSON_BLOCK = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/i;

function parseJSON(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[") && !trimmed.startsWith('"')) {
    throw new Error("Response does not have a JSON shape.");
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return JSON.parse(jsonrepair(trimmed));
  }
}

export function parseJSONResponse(rawResponse: string): unknown | null {
  const trimmed = rawResponse.trim();
  const fenced = trimmed.match(FENCED_JSON_BLOCK);
  const jsonText = fenced?.[1]?.trim() ?? trimmed;

  try {
    const parsed = parseJSON(jsonText);
    if (typeof parsed !== "string") return parsed;

    const nested = parseJSON(parsed);
    return typeof nested === "string" ? null : nested;
  } catch {
    return null;
  }
}
