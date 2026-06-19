import type { ListAdminUsersResponse, DeleteAdminUserResponse } from "@/app/api/admin/users/responses";
import type { ImpersonateUserResponse } from "@/app/api/admin/impersonate/responses";
import type { AdminUsersFilters } from "./admin-users-query-keys";

async function readJsonResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | ({ error?: string | { message?: string } } & T)
    | null;
  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : (data?.error?.message ?? fallback);
    throw new Error(message);
  }
  return data as T;
}

export async function listAdminUsers(
  filters: AdminUsersFilters,
): Promise<ListAdminUsersResponse> {
  const params = new URLSearchParams({ page: String(filters.page) });
  if (filters.search) params.set("search", filters.search);

  const response = await fetch(`/api/admin/users?${params}`);
  return readJsonResponse<ListAdminUsersResponse>(
    response,
    "Could not load users.",
  );
}

export async function impersonateUser(
  userId: string,
): Promise<ImpersonateUserResponse> {
  const response = await fetch("/api/admin/impersonate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  return readJsonResponse<ImpersonateUserResponse>(
    response,
    "Could not start impersonation.",
  );
}

export async function deleteAdminUser(
  userId: string,
): Promise<DeleteAdminUserResponse> {
  const response = await fetch(`/api/admin/users?userId=${userId}`, {
    method: "DELETE",
  });
  return readJsonResponse<DeleteAdminUserResponse>(
    response,
    "Could not delete user.",
  );
}

