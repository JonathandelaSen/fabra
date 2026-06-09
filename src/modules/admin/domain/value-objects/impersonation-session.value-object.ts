import {
  UserId,
  ValueObject,
  type UserId as UserIdType,
} from "@/modules/shared";
import { UserEmail } from "./user-email.value-object";

export interface ImpersonationSessionPrimitives {
  tokenHash: string;
  targetUserId: string;
  targetEmail: string;
}

export class ImpersonationSession extends ValueObject<ImpersonationSessionPrimitives> {
  private constructor(
    private readonly sessionTokenHash: string,
    private readonly sessionTargetUserId: UserIdType,
    private readonly sessionTargetEmail: UserEmail
  ) {
    super();
    if (!sessionTokenHash.trim()) {
      throw new Error("Impersonation token hash cannot be empty.");
    }
  }

  static fromPrimitives(
    primitives: ImpersonationSessionPrimitives
  ): ImpersonationSession {
    return new ImpersonationSession(
      primitives.tokenHash,
      UserId.fromPrimitives(primitives.targetUserId),
      UserEmail.fromPrimitives(primitives.targetEmail)
    );
  }

  toPrimitives(): ImpersonationSessionPrimitives {
    return {
      tokenHash: this.sessionTokenHash,
      targetUserId: this.sessionTargetUserId.toPrimitives(),
      targetEmail: this.sessionTargetEmail.toPrimitives(),
    };
  }

  get targetUserId(): string {
    return this.sessionTargetUserId.toPrimitives();
  }

  get targetEmail(): string {
    return this.sessionTargetEmail.toPrimitives();
  }
}
