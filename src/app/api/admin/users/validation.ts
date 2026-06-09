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
