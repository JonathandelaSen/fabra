import { jsonrepair } from "jsonrepair";
import { badRequest } from "@/modules/shared";

const FENCED_JSON_BLOCK = /^```json\s*\n([\s\S]*?)\n?```\s*$/i;
const ANY_FENCED_BLOCK = /```/g;

export function extractCopyPasteJson(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw badRequest("Paste the JSON response from the external chat.");
  }

  const fenceCount = trimmed.match(ANY_FENCED_BLOCK)?.length ?? 0;
  if (fenceCount > 2) {
    throw badRequest("Paste a single JSON block only.");
  }

  const fenced = trimmed.match(FENCED_JSON_BLOCK);
  const jsonText = fenced ? fenced[1].trim() : trimmed;

  if (!fenced && fenceCount > 0) {
    throw badRequest("Use a single fenced json block or pure JSON.");
  }

  try {
    return JSON.parse(jsonText);
  } catch {
    // LLM chat responses frequently produce almost-valid JSON (unescaped inner
    // quotes, trailing commas, etc.). Attempt a best-effort repair before failing.
    try {
      return JSON.parse(jsonrepair(jsonText));
    } catch {
      throw badRequest("The pasted response is not valid JSON.");
    }
  }
}
