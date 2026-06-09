export function parseImpersonateUserRequest(body: unknown) {
  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { userId?: unknown }).userId !== "string" ||
    (body as { userId: string }).userId.trim().length === 0
  ) {
    return {
      ok: false,
      error: { message: "userId is required", status: 400 },
    } as const;
  }

  return {
    ok: true,
    value: { userId: (body as { userId: string }).userId.trim() },
  } as const;
}
