import type { ListAdminUsersResponse } from "@/app/api/admin/users/responses";
import type { ImpersonateUserResponse } from "@/app/api/admin/impersonate/responses";
import type { AdminUsersFilters } from "./admin-users-query-keys";

async function parseError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  const message =
    typeof data?.error === "string"
      ? data.error
      : (data?.error?.message ?? fallback);
  return new Error(message);
}

export async function listAdminUsers(
  filters: AdminUsersFilters,
): Promise<ListAdminUsersResponse> {
  const params = new URLSearchParams({ page: String(filters.page) });
  if (filters.search) params.set("search", filters.search);

  const response = await fetch(`/api/admin/users?${params}`);
  if (!response.ok) {
    throw await parseError(response, "Could not load users.");
  }

  return (await response.json()) as ListAdminUsersResponse;
}

export async function impersonateUser(
  userId: string,
): Promise<ImpersonateUserResponse> {
  const response = await fetch("/api/admin/impersonate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw await parseError(response, "Could not start impersonation.");
  }

  return (await response.json()) as ImpersonateUserResponse;
}
