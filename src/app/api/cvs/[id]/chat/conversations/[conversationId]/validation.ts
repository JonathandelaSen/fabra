export function parseRenameCVChatConversationRequest(body: unknown) {
  const title = typeof body === "object" && body !== null && "title" in body && typeof body.title === "string"
    ? body.title.trim()
    : "";
  return title
    ? { ok: true, value: { title } } as const
    : { ok: false, error: { message: "title is required", status: 400 as const } } as const;
}
