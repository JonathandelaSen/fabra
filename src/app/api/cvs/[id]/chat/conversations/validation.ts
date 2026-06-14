export function parseCreateCVChatConversationRequest(body: unknown) {
  const title = typeof body === "object" && body !== null && "title" in body && typeof body.title === "string"
    ? body.title.trim()
    : "";
  return { ok: true, value: { title: title || undefined } } as const;
}
