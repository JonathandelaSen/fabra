import { createAdminClient } from "@/lib/supabase/admin";
import { User } from "../../domain/entities/user.entity";
import type {
  UserRepository,
  UserSearchCriteria,
  UserSearchResult,
} from "../../domain/repositories/user.repository";

const FETCH_PAGE_SIZE = 1000;
const MAX_FETCH_PAGES = 10;

export class SupabaseUserRepository implements UserRepository {
  async search(criteria: UserSearchCriteria): Promise<UserSearchResult> {
    const admin = createAdminClient();

    const allUsers = [];
    for (let fetchPage = 1; fetchPage <= MAX_FETCH_PAGES; fetchPage++) {
      const { data, error } = await admin.auth.admin.listUsers({
        page: fetchPage,
        perPage: FETCH_PAGE_SIZE,
      });
      if (error) throw error;
      allUsers.push(...data.users);
      if (data.users.length < FETCH_PAGE_SIZE) break;
    }

    const normalizedSearch = criteria.search.trim().toLowerCase();
    const filtered = allUsers
      .filter((user) => Boolean(user.email))
      .filter(
        (user) =>
          !normalizedSearch ||
          user.email!.toLowerCase().includes(normalizedSearch)
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    const start = (criteria.page - 1) * criteria.perPage;
    const users = filtered
      .slice(start, start + criteria.perPage)
      .map((user) =>
        User.fromPrimitives({
          id: user.id,
          email: user.email!,
          createdAt: user.created_at,
        })
      );

    return { users, total: filtered.length };
  }
}
