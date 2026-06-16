export function parseListAdminUsersRequest(params: URLSearchParams) {
  const rawPage = Number(params.get("page") ?? "1");
  const page =
    Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  return {
    ok: true,
    value: {
      search: params.get("search") ?? "",
      page,
    },
  } as const;
}

export function parseDeleteUserRequest(params: URLSearchParams) {
  const userId = params.get("userId");
  if (!userId) {
    return {
      ok: false,
      error: { message: "userId is required", status: 400 },
    } as const;
  }
  return {
    ok: true,
    value: { userId },
  } as const;
}

