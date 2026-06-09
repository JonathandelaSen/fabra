export interface AdminUserResponse {
  id: string;
  email: string;
  createdAt: string;
}

export interface ListAdminUsersResponse {
  users: AdminUserResponse[];
  page: number;
  perPage: number;
  total: number;
}
