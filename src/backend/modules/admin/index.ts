export { createAdminModule, type AdminModule } from "./admin.module";
export {
  USERS_PER_PAGE,
  type ListUsersInput,
} from "./application/use-cases/list-users.use-case";
export {
  UsersPage,
  type UsersPagePrimitives,
} from "./domain/value-objects/users-page.value-object";
export type { StartUserImpersonationInput } from "./application/use-cases/start-user-impersonation.use-case";
export type { UserPrimitives } from "./domain/entities/user.entity";
export {
  ImpersonationSession,
  type ImpersonationSessionPrimitives,
} from "./domain/value-objects/impersonation-session.value-object";
export { SelfImpersonationError } from "./domain/errors/self-impersonation.error";
export { ImpersonationTargetNotFoundError } from "./domain/errors/impersonation-target-not-found.error";
