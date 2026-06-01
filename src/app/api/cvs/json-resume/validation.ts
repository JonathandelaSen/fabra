const MAX_JSON_SIZE = 1024 * 1024; // 1MB

interface ParsedJsonResumeInput {
  jsonContent: string;
  name?: string;
  filename?: string;
}

type ParseResult =
  | { ok: true; value: ParsedJsonResumeInput }
  | { ok: false; error: { message: string; status: number } };

export function parseJsonResumeFromJson(body: unknown): ParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: { message: "Request body is required", status: 400 } };
  }

  const { content, name } = body as Record<string, unknown>;

  if (typeof content !== "string" || !content.trim()) {
    return { ok: false, error: { message: "content field is required and must be a non-empty string", status: 400 } };
  }

  if (Buffer.byteLength(content, "utf-8") > MAX_JSON_SIZE) {
    return { ok: false, error: { message: "JSON content exceeds 1MB limit", status: 400 } };
  }

  return {
    ok: true,
    value: {
      jsonContent: content,
      name: typeof name === "string" && name.trim() ? name.trim() : undefined,
    },
  };
}

export async function parseJsonResumeFromFormData(formData: FormData): Promise<ParseResult> {
  const file = formData.get("file");
  const name = formData.get("name");

  if (!file || !(file instanceof File)) {
    return { ok: false, error: { message: "file field is required", status: 400 } };
  }

  if (!file.name.endsWith(".json")) {
    return { ok: false, error: { message: "File must be a .json file", status: 400 } };
  }

  if (file.size > MAX_JSON_SIZE) {
    return { ok: false, error: { message: "File exceeds 1MB limit", status: 400 } };
  }

  const content = await file.text();

  return {
    ok: true,
    value: {
      jsonContent: content,
      name: typeof name === "string" && name.trim() ? name.trim() : undefined,
      filename: file.name,
    },
  };
}
